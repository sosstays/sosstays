import { Phone, MapPin, Mail } from "lucide-react";
import { Reveal } from "@/components/Reveal";

const WHATSAPP_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
    <path d="M17.6 6.32A7.85 7.85 0 0 0 12.02 4a7.94 7.94 0 0 0-6.9 11.87L4 20l4.24-1.11a7.9 7.9 0 0 0 3.78.96h.01a7.95 7.95 0 0 0 5.6-13.53ZM12.02 18.4a6.6 6.6 0 0 1-3.36-.92l-.24-.14-2.5.66.67-2.44-.16-.25a6.58 6.58 0 0 1 10.35-8.05 6.53 6.53 0 0 1 1.93 4.67 6.6 6.6 0 0 1-6.69 6.47Zm3.6-4.93c-.2-.1-1.17-.58-1.35-.64-.18-.07-.31-.1-.44.1-.13.2-.5.64-.62.77-.11.13-.23.14-.43.05-.2-.1-.83-.31-1.58-.98a5.9 5.9 0 0 1-1.1-1.36c-.11-.2 0-.3.09-.4.09-.09.2-.23.3-.35.1-.12.13-.2.2-.33.06-.13.03-.25-.02-.35-.05-.1-.44-1.06-.6-1.45-.16-.38-.32-.33-.44-.34h-.38c-.13 0-.34.05-.52.25-.18.2-.68.66-.68 1.62 0 .96.7 1.88.8 2.01.1.13 1.37 2.1 3.33 2.94.46.2.83.32 1.11.41.47.15.9.13 1.24.08.38-.06 1.17-.48 1.34-.94.16-.46.16-.86.11-.94-.05-.08-.18-.13-.38-.23Z" />
  </svg>
);

type ContactMethod = {
  label: string;
  value: string;
  href: string;
  icon: React.ReactNode;
  external?: boolean;
};

export function ContactMethodsGrid({
  phone = "+353 89 480 1345",
  address = "The Mill Enterprise Centre, Drogheda, Co. Louth, Ireland",
  email = "hello@sosstays.com",
}: {
  phone?: string;
  address?: string;
  email?: string;
}) {
  const methods: ContactMethod[] = [
    { label: "Phone", value: phone, href: `tel:${phone.replace(/\s+/g, "")}`, icon: <Phone className="h-6 w-6" strokeWidth={1.75} /> },
    {
      label: "WhatsApp",
      value: phone,
      href: `https://wa.me/${phone.replace(/\D/g, "")}`,
      icon: WHATSAPP_ICON,
      external: true,
    },
    { label: "Location", value: address, href: "https://maps.google.com/?q=" + encodeURIComponent(address), icon: <MapPin className="h-6 w-6" strokeWidth={1.75} />, external: true },
    { label: "Email", value: email, href: `mailto:${email}`, icon: <Mail className="h-6 w-6" strokeWidth={1.75} /> },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {methods.map((method, i) => (
        <Reveal key={method.label} delay={i * 80}>
          <a
            href={method.href}
            target={method.external ? "_blank" : undefined}
            rel={method.external ? "noopener noreferrer" : undefined}
            className="group flex h-full flex-col items-center gap-4 rounded-[18px] border border-sage-grey/25 bg-cream p-8 text-center shadow-sm transition-colors hover:border-forest-green/40"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-[14px] bg-pale-sage text-forest-green transition-colors group-hover:bg-forest-green group-hover:text-cream">
              {method.icon}
            </span>
            <span className="font-serif text-lg font-bold text-forest-green">{method.label}</span>
            <span className="text-[15px] leading-relaxed text-near-black/70">{method.value}</span>
          </a>
        </Reveal>
      ))}
    </div>
  );
}
