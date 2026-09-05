import { Zap, Globe, Smartphone, Server, Timer } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import InboxAddressBar from "@/components/inbox/InboxAddressBar";
import CountdownTimer from "@/components/inbox/CountdownTimer";
import SettingsPanel from "@/components/inbox/SettingsPanel";
import EmailList from "@/components/inbox/EmailList";
import InboxSwitcher from "@/components/inbox/InboxSwitcher";
import PlanStatusBadge from "@/components/inbox/PlanStatusBadge";

const features = [
  {
    icon: Zap,
    label: "Instant inbox",
    description: "Generated in milliseconds, no account needed",
    tier: "All",
  },
  {
    icon: Timer,
    label: "Auto-cleanup",
    description: "Inboxes expire and vanish on their own",
    tier: "All",
  },
  {
    icon: Globe,
    label: "Multiple domains",
    description: "Choose from a curated list of trusted domains",
    tier: "All",
  },
  {
    icon: Smartphone,
    label: "One-tap OTP",
    description: "Verification codes detected and copied instantly",
    tier: "All",
  },
  {
    icon: Server,
    label: "Full REST API",
    description: "Programmatic access with key auth and docs",
    tier: "Paid",
  },
];

export const metadata = {
  title: "SwiftMail · Disposable Email, Instantly",
  description:
    "The fastest inbox you'll ever delete. No signup. No credit card. Generate a disposable email in milliseconds.",
  openGraph: {
    title: "SwiftMail · Disposable Email, Instantly",
    description:
      "The fastest inbox you'll ever delete. No signup. No credit card. Generate a disposable email in milliseconds.",
    siteName: "SwiftMail",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SwiftMail · Disposable Email, Instantly",
    description:
      "The fastest inbox you'll ever delete. No signup. No credit card.",
  },
};

function FeatureItem({ icon: Icon, label, description, tier }) {
  return (
    <div className="group flex items-start gap-4 p-3 -mx-3 rounded-2xl hover:bg-surface/40 transition-colors duration-200">
      <div className="nm-icon-circle w-11 h-11 shrink-0 text-accent group-hover:scale-110 transition-transform duration-200">
        <Icon size={18} />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-text">{label}</span>
          {tier !== "All" && (
            <span className="text-[10px] font-bold text-muted uppercase tracking-[0.1em] nm-badge px-2 py-0.5">
              {tier}
            </span>
          )}
        </div>
        <p className="text-[13px] text-muted mt-1 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28 pb-12 text-center sm:text-left">
          <h1 className="text-heading text-[clamp(2.5rem,6vw,4.5rem)] text-text max-w-4xl leading-[1.02]">
            The fastest inbox
            <br />
            <span className="text-nm-engraved">you&apos;ll ever delete.</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-muted leading-relaxed max-w-xl font-medium">
            Disposable email generated in milliseconds.
            <br />
            <span className="text-accent-gradient font-bold">
              No account. No friction. Just inbox.
            </span>
          </p>
        </section>

        {/* Inbox Tool */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 space-y-5 pb-10">
          <InboxAddressBar />

          <div className="flex items-center justify-between text-sm">
            <PlanStatusBadge />
          </div>

          <CountdownTimer />
          <SettingsPanel />
        </section>

        {/* My Inboxes */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-6">
          <InboxSwitcher />
        </section>

        {/* Email List */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-10">
          <EmailList />
        </section>

        {/* Features */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-28">
          <div className="text-center mb-14">
            <span className="text-label mb-3 block">Capabilities</span>
            <h2 className="text-heading text-[clamp(1.8rem,4vw,2.8rem)] text-text">
              Everything you need,
              <br />
              <span className="text-nm-engraved">nothing you don&apos;t.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-4">
            {features.map((f) => (
              <FeatureItem key={f.label} {...f} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
