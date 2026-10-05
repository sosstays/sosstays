import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "./supabase-admin";
import { subscribeToMailerLite } from "./mailerlite";

type Row = Record<string, unknown>;

const MAX_TEXT = 5000;

/** Trims strings, caps their length, and coerces numeric-looking text ("€120", "85%") to numbers. */
export function toNumber(value: unknown): number | undefined {
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value !== "string") return undefined;
  const n = Number(value.replace(/[^\d.-]/g, ""));
  return value.trim() && Number.isFinite(n) ? n : undefined;
}

/** Drops empty values so a resubmission never blanks out data we already have. */
function cleanRow(row: Row): Row {
  const out: Row = {};
  for (const [key, value] of Object.entries(row)) {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed) out[key] = trimmed.slice(0, MAX_TEXT);
    } else if (typeof value === "number") {
      if (Number.isFinite(value)) out[key] = value;
    } else if (typeof value === "boolean") {
      out[key] = value;
    }
  }
  return out;
}

interface SaveLeadOptions {
  table: string;
  email: string;
  /**
   * "upsert": one row per email — a resubmission updates that row.
   * "insert": every submission is its own row (e.g. contact queries).
   */
  mode: "upsert" | "insert";
  /** Written on create and on every update (empty values skipped). */
  row: Row;
  /** Written only when the row is first created (e.g. first-touch `source`). */
  onCreate?: Row;
  mailerlite: { fields?: Record<string, unknown>; groupId?: string };
}

type SaveResult = { ok: true; id: string } | { ok: false; skipped?: boolean };

async function saveToSupabase(opts: SaveLeadOptions): Promise<SaveResult> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.warn("SUPABASE_SERVICE_ROLE_KEY not set — skipping Supabase save for", opts.table);
    return { ok: false, skipped: true };
  }

  const email = opts.email.trim().toLowerCase();
  const values = cleanRow(opts.row);

  if (opts.mode === "insert") {
    const { data, error } = await supabase
      .from(opts.table)
      .insert({ ...values, ...cleanRow(opts.onCreate ?? {}), email })
      .select("id")
      .single();
    if (error) {
      console.error(`Supabase insert into ${opts.table} failed`, error);
      return { ok: false };
    }
    return { ok: true, id: data.id as string };
  }

  // Look up both the lowercased and as-typed email: rows backfilled before
  // this existed may not be lowercase, and the unique index is case-sensitive.
  async function findExistingId(): Promise<string | null> {
    const { data, error } = await supabase!
      .from(opts.table)
      .select("id")
      .in("email", Array.from(new Set([email, opts.email.trim()])))
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return (data?.id as string | undefined) ?? null;
  }

  async function update(id: string): Promise<SaveResult> {
    const { error } = await supabase!.from(opts.table).update(values).eq("id", id);
    if (error) {
      console.error(`Supabase update of ${opts.table} ${id} failed`, error);
      return { ok: false };
    }
    return { ok: true, id };
  }

  try {
    const existingId = await findExistingId();
    if (existingId) return await update(existingId);

    const { data, error } = await supabase
      .from(opts.table)
      .insert({ ...values, ...cleanRow(opts.onCreate ?? {}), email })
      .select("id")
      .single();
    if (!error) return { ok: true, id: data.id as string };

    // Two near-simultaneous submissions for the same email: the other one won
    // the insert, so just update its row.
    if (error.code === "23505") {
      const raceId = await findExistingId();
      if (raceId) return await update(raceId);
    }
    console.error(`Supabase insert into ${opts.table} failed`, error);
    return { ok: false };
  } catch (err) {
    console.error(`Supabase save to ${opts.table} failed`, err);
    return { ok: false };
  }
}

/**
 * Saves a website form submission to Supabase (source of truth) and then
 * pushes it to MailerLite (marketing tool), recording the MailerLite
 * subscriber id back on the row.
 *
 * Neither system blocks the other: the visitor sees success if at least one
 * of them took the submission, so a MailerLite outage doesn't lose the lead
 * (it stays in Supabase with mailerlite_synced_at empty), and a missing
 * Supabase key doesn't break forms that used to work.
 */
export async function saveLead(opts: SaveLeadOptions): Promise<NextResponse> {
  const saved = await saveToSupabase(opts);
  const ml = await subscribeToMailerLite({ email: opts.email, ...opts.mailerlite });

  if (saved.ok && ml.ok) {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase!
      .from(opts.table)
      .update({
        mailerlite_subscriber_id: ml.subscriberId,
        mailerlite_synced_at: new Date().toISOString(),
      })
      .eq("id", saved.id);
    if (error) console.error(`Recording MailerLite sync on ${opts.table} ${saved.id} failed`, error);
  } else if (saved.ok && !ml.ok) {
    console.error(`MailerLite sync failed for ${opts.table} ${saved.id}`, ml);
  }

  if (saved.ok || ml.ok) return NextResponse.json({ ok: true });

  // Both failed (or Supabase isn't configured and MailerLite failed): report
  // MailerLite's error exactly as before this change.
  return NextResponse.json(
    { error: ml.error, ...(ml.detail ? { detail: ml.detail } : {}) },
    { status: ml.status }
  );
}
