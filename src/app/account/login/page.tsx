"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendLink() {
    if (status === "sent") setResending(true);
    else setStatus("sending");
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/account`,
      },
    });

    setResending(false);
    if (error) {
      setStatus("error");
      setError(error.message);
      return;
    }
    setStatus("sent");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendLink();
  }

  return (
    <main className="grid min-h-screen overflow-x-hidden bg-cream font-sans text-near-black lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)]">
      {/* Left panel — same green band + pattern treatment as /stays/[slug]/book */}
      <div className="relative flex flex-col justify-between overflow-hidden bg-deep-forest px-8 py-8 sm:px-11 sm:py-11">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "url('/images/sos-mark-pattern.svg')",
            backgroundSize: "150px",
            backgroundRepeat: "repeat",
          }}
        />
        <Image
          src="/booking-flow/mark-sage.svg"
          alt=""
          width={256}
          height={264}
          className="pointer-events-none absolute -bottom-24 -left-24 h-auto w-64 opacity-20"
        />

        <Link href="/" className="relative flex items-center gap-2.5">
          <Logo className="h-[30px] w-auto text-cream" />
        </Link>

        <div className="relative max-w-xs">
          <span className="mb-3.5 inline-block text-xs tracking-[0.06em] text-sage-300 uppercase">
            No passwords here
          </span>
          <h2 className="mb-3 font-serif text-3xl leading-[1.05] font-extrabold tracking-tight text-cream">
            One email, one link, you&apos;re in.
          </h2>
          <p className="text-[15px] leading-[1.55] text-sage-300">
            Your bookings live against the email you paid with. Nothing to remember, nothing to reset.
          </p>
        </div>
      </div>

      {/* Right panel — the form itself */}
      <div className="flex items-center justify-center px-8 py-14 sm:px-11">
        <div className="w-full max-w-[420px]">
          {status === "sent" ? (
            <div className="flex flex-col gap-[22px]">
              <CheckEnvelopeIcon />
              <div>
                <h1 className="mb-2.5 font-serif text-[2rem] leading-[1.05] font-extrabold tracking-tight text-near-black">
                  Check your email.
                </h1>
                <p className="text-lg leading-[1.55] text-near-black/70">
                  We&apos;ve sent a link to{" "}
                  <strong className="font-semibold text-near-black">{email}</strong>. Tap it and
                  you&apos;ll land straight on your bookings.
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-[10px] border border-sage-grey/40 bg-pale-sage/40 px-4 py-3.5">
                <ClockIcon />
                <span className="text-sm text-near-black/70">
                  Open it on this device. Nothing yet? Have a look in spam.
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <Button variant="secondary" size="md" onClick={sendLink} disabled={resending}>
                  {resending ? "Sending…" : "Send again"}
                </Button>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="rounded-full px-8 py-4 text-[15px] font-semibold text-near-black/60 underline-offset-4 hover:text-near-black hover:underline"
                >
                  Different email
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-[22px]">
              <div>
                <h1 className="mb-2.5 font-serif text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.05] font-extrabold tracking-tight text-near-black">
                  Your breaks
                </h1>
                <p className="text-lg leading-[1.55] text-near-black/70">
                  Pop in the email you booked with and we&apos;ll send you a way in.
                </p>
              </div>

              <label className="flex flex-col gap-1.5 text-sm text-near-black">
                Email
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="aoife@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-[10px] border border-sage-grey/50 bg-bright-cream px-4 py-3 font-sans text-[15px] text-near-black"
                />
              </label>

              {status === "error" && error && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-[10px] border border-error-red/40 border-l-4 bg-error-red/5 px-4 py-3.5"
                >
                  <AlertIcon />
                  <span className="text-sm leading-[1.55] text-near-black/70">{error}</span>
                </div>
              )}

              <Button type="submit" disabled={status === "sending"} size="md" className="w-full">
                {status === "sending" ? "Sending link…" : "Email me a link"}
              </Button>

              <p className="text-xs leading-[1.6] text-near-black/55">
                No password to remember. Booked as a guest? Same email, same place.
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

function CheckEnvelopeIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="38" stroke="var(--light-sage)" strokeWidth="3" />
      <rect x="31" y="40" width="38" height="26" rx="4" stroke="var(--forest-green)" strokeWidth="4" />
      <path d="M32 43l18 13 18-13" stroke="var(--forest-green)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--forest-green)" strokeWidth="1.8" strokeLinecap="round" className="flex-none">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--error-red)" strokeWidth="2" strokeLinecap="round" className="mt-0.5 flex-none">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}
