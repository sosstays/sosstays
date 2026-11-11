"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { ConsentCheckbox } from "@/components/ConsentCheckbox";

export type GiftCatalogueItem = {
  _id: string;
  name: string;
  price: number;
  kind: "goods" | "voucher";
};

// Fixed voucher denominations for gift-maker packages — a deliberately
// simpler, round set than the shop's own flexible €50–€1,000 gift voucher,
// since these are quoted by hand rather than checked out live.
const VOUCHER_TIERS = [100, 75, 50, 25] as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const HOW_HEARD_OPTIONS = [
  "Google search",
  "ChatGPT / Claude",
  "Social media",
  "Referred by a friend",
  "Email",
  "Other",
];

function isMainVoucher(name: string) {
  return name.trim().toLowerCase().startsWith("gift voucher");
}

function money(n: number) {
  return `€${(Math.round(n * 100) / 100).toLocaleString("en-IE", {
    minimumFractionDigits: n % 1 ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

type Format = "physical" | "virtual" | "hybrid";

type PackageItem = {
  id: string;
  baseId?: string;
  name: string;
  price: number;
  isVoucher?: boolean;
};

type GiftPackage = {
  pkgId: string;
  label: string;
  items: PackageItem[];
  total: number;
  overBudget: boolean;
};

function pickVoucherTier(budget: number): number {
  const half = budget / 2;
  for (const tier of VOUCHER_TIERS) {
    if (tier <= half) return tier;
  }
  return VOUCHER_TIERS[VOUCHER_TIERS.length - 1];
}

function eligiblePool(products: GiftCatalogueItem[], format: Format): GiftCatalogueItem[] {
  if (format === "physical") return products.filter((p) => p.kind === "goods");
  if (format === "virtual") return products.filter((p) => p.kind === "voucher");
  return products;
}

let pkgSeq = 0;

function buildPackage(
  flavor: "mix" | "best" | "treat",
  budget: number,
  format: Format,
  products: GiftCatalogueItem[]
): GiftPackage {
  const items: PackageItem[] = [];
  let remaining = budget;
  let overBudget = false;

  if (format !== "physical") {
    const tier = pickVoucherTier(budget);
    items.push({ id: `voucher-${tier}`, baseId: "voucher", name: "SOS Gift Voucher", price: tier, isVoucher: true });
    if (tier > remaining) {
      overBudget = true;
      remaining = 0;
    } else {
      remaining -= tier;
    }
  }

  const pool = eligiblePool(products, format).slice();
  pool.sort((a, b) => (flavor === "mix" ? a.price - b.price : b.price - a.price));

  if (flavor === "treat") {
    const fit = pool.find((p) => p.price <= remaining);
    if (fit) {
      items.push({ id: fit._id, name: fit.name, price: fit.price });
      remaining -= fit.price;
    }
  } else {
    for (const p of pool) {
      if (p.price <= remaining) {
        items.push({ id: p._id, name: p.name, price: p.price });
        remaining -= p.price;
      }
    }
  }

  const total = items.reduce((sum, i) => sum + i.price, 0);
  const label = { mix: "More to unwrap", best: "Best use of budget", treat: "One standout experience" }[flavor];
  return { pkgId: `pkg-${pkgSeq++}`, label, items, total, overBudget: overBudget || total > budget };
}

function packageKey(pkg: GiftPackage) {
  return pkg.items
    .map((i) => i.id)
    .sort()
    .join("|");
}

function generatePackages(budget: number, format: Format, products: GiftCatalogueItem[]): GiftPackage[] {
  const flavors: Array<"mix" | "best" | "treat"> = ["mix", "best", "treat"];
  const seen = new Set<string>();
  const out: GiftPackage[] = [];
  for (const flavor of flavors) {
    const pkg = buildPackage(flavor, budget, format, products);
    if (pkg.items.length === 0) continue;
    const key = packageKey(pkg);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(pkg);
  }
  return out.slice(0, 3);
}

function OptionCard({
  icon,
  title,
  desc,
  selected,
  onSelect,
}: {
  icon?: string;
  title: string;
  desc?: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex flex-col gap-1.5 rounded-[14px] border px-5 py-4.5 text-left transition-colors ${
        selected
          ? "border-forest-green bg-light-forest-green/50"
          : "border-sage-grey/50 bg-cream hover:border-forest-green/50"
      }`}
    >
      {icon && <span className="text-xl">{icon}</span>}
      <span className="text-[15px] font-semibold text-near-black">{title}</span>
      {desc && <span className="text-[12.5px] leading-snug text-near-black/60">{desc}</span>}
    </button>
  );
}

export function GiftMakerWizard({ products }: { products: GiftCatalogueItem[] }) {
  const router = useRouter();
  const catalogue = useMemo(() => products.filter((p) => !isMainVoucher(p.name)), [products]);

  type Step = "recipient" | "quantity" | "budget" | "format" | "delivery" | "results";
  const [step, setStep] = useState<Step>("recipient");
  const [recipient, setRecipient] = useState<"work" | "personal" | "">("");
  const [group, setGroup] = useState<"one" | "many" | "">("");
  const [qty, setQty] = useState(5);
  const [budget, setBudget] = useState(50);
  const [format, setFormat] = useState<Format | "">("");
  const [delivery, setDelivery] = useState<"single" | "multiple" | "">("");

  const [packages, setPackages] = useState<GiftPackage[]>([]);
  const [selectedPkgId, setSelectedPkgId] = useState<string | null>(null);
  const [resultsView, setResultsView] = useState<"browse" | "details" | "done">("browse");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [billing, setBilling] = useState<"business" | "personal" | "">("");
  const [howHeard, setHowHeard] = useState("");
  const [consent, setConsent] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function activeSteps(): Step[] {
    const steps: Step[] = ["recipient", "quantity", "budget", "format"];
    if (format !== "virtual" && group === "many") steps.push("delivery");
    steps.push("results");
    return steps;
  }

  function goNext(from: Step) {
    const steps = activeSteps();
    const idx = steps.indexOf(from);
    const next = steps[idx + 1];
    if (next === "results") {
      setPackages(generatePackages(budget, format as Format, catalogue));
      setSelectedPkgId(null);
      setResultsView("browse");
    }
    setStep(next);
  }
  function goBack(from: Step) {
    const steps = activeSteps();
    const idx = steps.indexOf(from);
    setStep(steps[Math.max(0, idx - 1)]);
  }

  const questionSteps: Step[] = activeSteps().filter((s) => s !== "results");
  const stepIdx = questionSteps.indexOf(step);

  function updatePackage(pkgId: string, updater: (pkg: GiftPackage) => GiftPackage) {
    setPackages((prev) => prev.map((p) => (p.pkgId === pkgId ? recompute(updater(p)) : p)));
  }
  function recompute(pkg: GiftPackage): GiftPackage {
    const total = pkg.items.reduce((s, i) => s + i.price, 0);
    return { ...pkg, total, overBudget: total > budget };
  }

  function removeItem(pkgId: string, itemId: string) {
    updatePackage(pkgId, (pkg) => ({ ...pkg, items: pkg.items.filter((i) => i.id !== itemId) }));
  }
  function addItem(pkgId: string, item: PackageItem) {
    updatePackage(pkgId, (pkg) => ({ ...pkg, items: [...pkg.items, item] }));
  }
  function addVoucher(pkgId: string, tier: number) {
    updatePackage(pkgId, (pkg) => ({
      ...pkg,
      items: [{ id: `voucher-${tier}`, baseId: "voucher", name: "SOS Gift Voucher", price: tier, isVoucher: true }, ...pkg.items],
    }));
  }

  async function submitQuote() {
    setSubmitError("");
    if (!name.trim() || !phone.trim() || !billing || !EMAIL_PATTERN.test(email.trim())) {
      setFieldError("Fill in your name, billing type, phone and a valid email.");
      return;
    }
    if (!consent) {
      setFieldError("Please agree to the Privacy Policy to continue.");
      return;
    }
    setFieldError("");
    const pkg = packages.find((p) => p.pkgId === selectedPkgId);
    setSubmitting(true);
    try {
      const res = await fetch("/api/gift-maker-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          billingType: billing,
          howHeard,
          recipientType: recipient,
          quantity: group === "many" ? qty : 1,
          budget,
          format,
          delivery: delivery || undefined,
          packageLabel: pkg?.label,
          packageItems: pkg?.items.map((i) => i.name).join(", "),
          packageTotal: pkg?.total,
          consent: true,
        }),
      });
      if (!res.ok) throw new Error(`Gift maker lead submission failed: ${res.status}`);
      setResultsView("done");
    } catch {
      setSubmitError("That didn't go through — please try again, or email hello@sosstays.com directly.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-[18px] border border-sage-grey/40 bg-warm-cream p-8 text-left sm:p-11">
      {step !== "results" && (
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-xs font-medium text-near-black/50">
            <span>
              Step {stepIdx + 1} of {questionSteps.length}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-sage-grey/30">
            <div
              className="h-full rounded-full bg-forest-green transition-all duration-300"
              style={{ width: `${((stepIdx + 1) / questionSteps.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {step === "recipient" && (
        <div className="flex flex-col gap-4.5">
          <h3 className="font-serif text-lg font-bold text-forest-green sm:text-xl">Who&apos;s this gift for?</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <OptionCard
              icon="🧑‍💼"
              title="A work colleague or employee"
              desc="Staff gifts, client thank-yous, team rewards."
              selected={recipient === "work"}
              onSelect={() => setRecipient("work")}
            />
            <OptionCard
              icon="❤️"
              title="Someone personal"
              desc="Family, a friend, a loved one."
              selected={recipient === "personal"}
              onSelect={() => setRecipient("personal")}
            />
          </div>
          <div className="mt-1 flex justify-end">
            <Button onClick={() => goNext("recipient")} disabled={!recipient} variant="primary" size="sm">
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === "quantity" && (
        <div className="flex flex-col gap-4.5">
          <h3 className="font-serif text-lg font-bold text-forest-green sm:text-xl">How many people are you gifting?</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <OptionCard icon="1" title="Just one person" selected={group === "one"} onSelect={() => setGroup("one")} />
            <OptionCard icon="👥" title="A group of people" selected={group === "many"} onSelect={() => setGroup("many")} />
          </div>
          {group === "many" && (
            <div className="flex items-center gap-4 pt-1">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(2, q - 1))}
                className="flex h-10 w-10 flex-none items-center justify-center rounded-full border border-forest-green text-lg font-semibold text-forest-green hover:bg-light-forest-green/50"
              >
                −
              </button>
              <span className="font-serif min-w-[56px] text-center text-2xl font-bold text-deep-forest">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(500, q + 1))}
                className="flex h-10 w-10 flex-none items-center justify-center rounded-full border border-forest-green text-lg font-semibold text-forest-green hover:bg-light-forest-green/50"
              >
                +
              </button>
              <span className="text-sm text-near-black/55">people</span>
            </div>
          )}
          <div className="mt-1 flex justify-between">
            <button type="button" onClick={() => goBack("quantity")} className="rounded-full border border-sage-grey/60 px-6 py-3 text-sm font-semibold text-near-black">
              Back
            </button>
            <Button onClick={() => goNext("quantity")} disabled={!group} variant="primary" size="sm">
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === "budget" && (
        <div className="flex flex-col gap-4.5">
          <h3 className="font-serif text-lg font-bold text-forest-green sm:text-xl">What&apos;s your budget per gift?</h3>
          <p className="text-[13px] text-near-black/60">We&apos;ll match this against real prices in the shop.</p>
          <div className="font-serif text-4xl font-bold text-deep-forest">
            {money(budget)} <span className="font-sans text-sm font-medium text-near-black/55">per person</span>
          </div>
          <input
            type="range"
            min={10}
            max={200}
            step={5}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="w-full accent-forest-green"
          />
          <div className="mt-1 flex justify-between">
            <button type="button" onClick={() => goBack("budget")} className="rounded-full border border-sage-grey/60 px-6 py-3 text-sm font-semibold text-near-black">
              Back
            </button>
            <Button onClick={() => goNext("budget")} variant="primary" size="sm">
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === "format" && (
        <div className="flex flex-col gap-4.5">
          <h3 className="font-serif text-lg font-bold text-forest-green sm:text-xl">
            What matters more — unwrapping it, or using it?
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <OptionCard
              icon="📦"
              title="Physical"
              desc="Something to open — shipped to their door."
              selected={format === "physical"}
              onSelect={() => setFormat("physical")}
            />
            <OptionCard
              icon="✉️"
              title="Virtual only"
              desc="An e-voucher. Nothing to post, nothing to lose."
              selected={format === "virtual"}
              onSelect={() => setFormat("virtual")}
            />
            <OptionCard
              icon="🎁"
              title="Hybrid"
              desc="A physical piece, plus a voucher to use later."
              selected={format === "hybrid"}
              onSelect={() => setFormat("hybrid")}
            />
          </div>
          <div className="mt-1 flex justify-between">
            <button type="button" onClick={() => goBack("format")} className="rounded-full border border-sage-grey/60 px-6 py-3 text-sm font-semibold text-near-black">
              Back
            </button>
            <Button onClick={() => goNext("format")} disabled={!format} variant="primary" size="sm">
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === "delivery" && (
        <div className="flex flex-col gap-4.5">
          <h3 className="font-serif text-lg font-bold text-forest-green sm:text-xl">Delivering to one place, or several?</h3>
          <p className="text-[13px] text-near-black/60">Since there&apos;s something physical to send.</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <OptionCard
              icon="🏢"
              title="One location"
              desc="e.g. one office, we ship the lot together."
              selected={delivery === "single"}
              onSelect={() => setDelivery("single")}
            />
            <OptionCard
              icon="📍"
              title="Multiple locations"
              desc="Each person's own address."
              selected={delivery === "multiple"}
              onSelect={() => setDelivery("multiple")}
            />
          </div>
          <div className="mt-1 flex justify-between">
            <button type="button" onClick={() => goBack("delivery")} className="rounded-full border border-sage-grey/60 px-6 py-3 text-sm font-semibold text-near-black">
              Back
            </button>
            <Button onClick={() => goNext("delivery")} disabled={!delivery} variant="primary" size="sm">
              See gift options
            </Button>
          </div>
        </div>
      )}

      {step === "results" && resultsView === "browse" && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-[14px] bg-deep-forest px-6 py-5 text-cream">
            <div>
              <div className="font-serif text-lg font-bold">
                {group === "many" ? `Gifts for ${qty} people` : "A gift for someone special"}
              </div>
              <div className="text-[13.5px] text-cream/80">
                ~{money(budget)} per person · {format}
                {delivery ? ` · ${delivery === "multiple" ? "multiple addresses" : "one location"}` : ""}
              </div>
            </div>
            <div className="text-right text-[13px] text-cream/70">
              Estimated total
              <div className="font-serif text-xl font-bold text-cream">
                {money(budget * (group === "many" ? qty : 1))}
              </div>
            </div>
          </div>

          {format === "physical" && packages[0]?.items.length < 2 && (
            <p className="rounded-[10px] border border-dashed border-forest-green bg-pale-sage px-4 py-3 text-[13px] text-deep-forest">
              That&apos;s everything physical we stock right now. Try &quot;Hybrid&quot; to open up more options.
            </p>
          )}

          <p className="text-[13px] text-near-black/60">Pick an option, or add and remove items to make it your own.</p>

          <div className="flex flex-col gap-4">
            {packages.length === 0 && (
              <p className="text-[14px] text-near-black/60">No matches yet — go back and adjust your budget or format.</p>
            )}
            {packages.map((pkg) => {
              const have = new Set(pkg.items.map((i) => i.baseId ?? i.id));
              const others = catalogue.filter((p) => !have.has(p._id));
              const hasVoucher = pkg.items.some((i) => i.isVoucher);
              return (
                <div
                  key={pkg.pkgId}
                  className={`flex flex-col rounded-[14px] border p-5 ${
                    pkg.pkgId === selectedPkgId ? "border-2 border-forest-green bg-light-forest-green/40" : "border-sage-grey/50 bg-cream"
                  }`}
                >
                  {pkg.overBudget && (
                    <span className="mb-2 inline-block w-fit rounded-full bg-maroon/10 px-2.5 py-0.5 text-[10.5px] font-bold tracking-wide text-maroon uppercase">
                      Over budget
                    </span>
                  )}
                  <div className="mb-2 text-[11px] font-bold tracking-wide text-muted-maroon uppercase">{pkg.label}</div>
                  <div className="flex flex-col">
                    {pkg.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-3 border-b border-pale-sage py-2 text-[13.5px] last:border-0">
                        <span>
                          {item.name}
                          {item.isVoucher && (
                            <span className="ml-2 rounded-full bg-pale-sage px-2 py-0.5 text-[10px] font-bold tracking-wide text-forest-green uppercase">
                              Priority
                            </span>
                          )}
                        </span>
                        <span className="flex items-center gap-2.5">
                          <span className="font-semibold text-deep-forest">{money(item.price)}</span>
                          <button
                            type="button"
                            aria-label={`Remove ${item.name}`}
                            onClick={() => removeItem(pkg.pkgId, item.id)}
                            className="flex h-5.5 w-5.5 items-center justify-center rounded-full border border-sage-grey/60 text-[11px] text-near-black/55 hover:border-error-red hover:text-error-red"
                          >
                            ✕
                          </button>
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2.5 flex items-baseline justify-between border-t border-sage-grey/50 pt-2.5">
                    <span className="text-[12px] text-near-black/55">Package total</span>
                    <span className="font-serif text-xl font-bold text-forest-green">{money(pkg.total)}</span>
                  </div>

                  {(others.length > 0 || !hasVoucher) && (
                    <>
                      <div className="mt-3.5 mb-1.5 text-[11px] font-semibold tracking-wide text-near-black/50 uppercase">
                        Add to this package
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {!hasVoucher &&
                          [...VOUCHER_TIERS].reverse().map((tier) => (
                            <button
                              key={tier}
                              type="button"
                              onClick={() => addVoucher(pkg.pkgId, tier)}
                              className="rounded-full border border-dashed border-muted-maroon px-3 py-1.5 text-[11.5px] font-medium text-muted-maroon hover:border-solid"
                            >
                              + Voucher {money(tier)}
                            </button>
                          ))}
                        {others.map((item) => (
                          <button
                            key={item._id}
                            type="button"
                            onClick={() => addItem(pkg.pkgId, { id: item._id, name: item.name, price: item.price })}
                            className="rounded-full border border-dashed border-sage-grey px-3 py-1.5 text-[11.5px] font-medium text-near-black hover:border-forest-green hover:border-solid hover:text-forest-green"
                          >
                            + {item.name} · {money(item.price)}
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPkgId(pkg.pkgId);
                        setResultsView("details");
                      }}
                      className={`rounded-full border px-5 py-2.5 text-[13px] font-semibold ${
                        pkg.pkgId === selectedPkgId
                          ? "border-forest-green bg-forest-green text-cream"
                          : "border-forest-green text-forest-green"
                      }`}
                    >
                      {pkg.pkgId === selectedPkgId ? "✓ Selected — get a quote" : "Choose this option"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              setStep("recipient");
              setRecipient("");
              setGroup("");
              setQty(5);
              setBudget(50);
              setFormat("");
              setDelivery("");
              setPackages([]);
            }}
            className="self-start text-sm font-semibold text-near-black/60 hover:text-near-black"
          >
            ↺ Start over
          </button>
        </div>
      )}

      {step === "results" && resultsView === "details" && (
        <div className="flex flex-col gap-4.5">
          <h3 className="font-serif text-lg font-bold text-forest-green sm:text-xl">Get this quote emailed to you</h3>
          <p className="text-[13px] text-near-black/60">
            For: <strong>{packages.find((p) => p.pkgId === selectedPkgId)?.label}</strong> ·{" "}
            {money(packages.find((p) => p.pkgId === selectedPkgId)?.total ?? 0)} per person
          </p>
          <label className="flex flex-col gap-1.5 text-sm text-near-black">
            <span>Your name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              className="rounded-[10px] border border-sage-grey/50 bg-cream px-4 py-3 font-sans text-[15px] text-near-black"
            />
          </label>
          <div className="flex flex-col gap-1.5 text-sm text-near-black">
            <span>Billing</span>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setBilling("business")}
                className={`flex-1 rounded-[10px] border px-4 py-2.5 text-[13.5px] font-medium ${
                  billing === "business" ? "border-forest-green bg-light-forest-green/50 font-semibold text-deep-forest" : "border-sage-grey/50 bg-cream"
                }`}
              >
                Business billing
              </button>
              <button
                type="button"
                onClick={() => setBilling("personal")}
                className={`flex-1 rounded-[10px] border px-4 py-2.5 text-[13.5px] font-medium ${
                  billing === "personal" ? "border-forest-green bg-light-forest-green/50 font-semibold text-deep-forest" : "border-sage-grey/50 bg-cream"
                }`}
              >
                Personal billing
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm text-near-black">
              <span>Phone</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+353 89 000 0000"
                className="rounded-[10px] border border-sage-grey/50 bg-cream px-4 py-3 font-sans text-[15px] text-near-black"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-near-black">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="rounded-[10px] border border-sage-grey/50 bg-cream px-4 py-3 font-sans text-[15px] text-near-black"
              />
            </label>
          </div>
          <label className="flex flex-col gap-1.5 text-sm text-near-black">
            <span>How did you hear about us?</span>
            <select
              value={howHeard}
              onChange={(e) => setHowHeard(e.target.value)}
              className="rounded-[10px] border border-sage-grey/50 bg-cream px-4 py-3 font-sans text-[15px] text-near-black"
            >
              <option value="">— Select one —</option>
              {HOW_HEARD_OPTIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </label>
          <ConsentCheckbox checked={consent} onChange={setConsent} />
          {(fieldError || submitError) && (
            <p role="alert" className="text-[13px] text-error-red">
              {fieldError || submitError}
            </p>
          )}
          <div className="mt-1 flex justify-between">
            <button type="button" onClick={() => setResultsView("browse")} className="text-sm font-semibold text-near-black/60 hover:text-near-black">
              ← Back to options
            </button>
            <Button onClick={submitQuote} disabled={submitting} variant="primary" size="sm">
              {submitting ? "Sending…" : "Email me this quote"}
            </Button>
          </div>
        </div>
      )}

      {step === "results" && resultsView === "done" && (
        <div className="py-5 text-center">
          <div className="mb-3 text-4xl">✓</div>
          <h3 className="font-serif mb-2 text-xl font-bold text-forest-green">Quote on its way</h3>
          <p className="mx-auto max-w-[36ch] text-[14px] leading-relaxed text-near-black/65">
            We&apos;ll email <strong>{email}</strong> pricing for{" "}
            <strong>{packages.find((p) => p.pkgId === selectedPkgId)?.label}</strong> within one business day.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="rounded-full border border-sage-grey/60 px-6 py-3 text-sm font-semibold text-near-black"
            >
              Back to home
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("recipient");
                setRecipient("");
                setGroup("");
                setQty(5);
                setBudget(50);
                setFormat("");
                setDelivery("");
                setPackages([]);
                setSelectedPkgId(null);
                setName("");
                setPhone("");
                setEmail("");
                setBilling("");
                setConsent(false);
              }}
              className="rounded-full bg-forest-green px-6 py-3 text-sm font-semibold text-cream"
            >
              ↺ Start a new gift
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
