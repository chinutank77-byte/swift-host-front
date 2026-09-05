import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PlanCard from "@/components/pricing/PlanCard";
import { PLANS } from "@/lib/planData";

export const metadata = { title: "Pricing" };

const planOrder = ["drop", "spark", "rush", "apex"];

const featureDefs = [
  { key: "reqPerSec", label: "Requests/sec" },
  { key: "retention", label: "Retention" },
  { key: "concurrentInboxes", label: "Concurrent inboxes" },
  { key: "apiAccess", label: "API access" },
  { key: "adFree", label: "Ad-free" },
  { key: "otpExtraction", label: "OTP extraction" },
  { key: "encryptedInboxes", label: "At-rest encryption" },
];

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="max-w-7xl mx-auto px-6 sm:px-8 pt-20 pb-10 text-center">
          <span className="text-label mb-3 block">Pricing</span>
          <h1 className="text-heading text-[clamp(2rem,5vw,3.2rem)] text-text">Simple, transparent pricing.</h1>
          <p className="mt-4 text-lg text-muted font-medium max-w-lg mx-auto">Start free. Upgrade when the inbox grows.</p>
        </section>
 
        <section className="max-w-7xl mx-auto px-6 sm:px-8 pb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {planOrder.map((key) => {
              const plan = PLANS[key];
              return (
                <PlanCard
                  key={key}
                  planSlug={key}
                  name={plan.name}
                  price={plan.price}
                  description={plan.description}
                  isPopular={key === "rush"}
                  features={featureDefs.map((f) => ({
                    label: f.label,
                    value: plan[f.key],
                  }))}
                />
              );
            })}
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-6 sm:px-8 pb-20">
          <h2 className="text-heading text-[clamp(1.5rem,3vw,2rem)] text-text mb-8 hero-title">Questions? Answers.</h2>
          <div className="space-y-6">
            {[
              { q: "Do I need an account?", a: "No, the free tier works without signup." },
              { q: "What happens when my inbox expires?", a: "It's deleted. Generate a new one anytime." },
              { q: "Can I cancel anytime?", a: "Yes, cancel from your dashboard. No questions asked." },
            ].map((faq) => (
              <div key={faq.q} className="glass-sm p-5">
                <h3 className="text-sm font-semibold text-text">{faq.q}</h3>
                <p className="text-sm text-muted mt-1">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
