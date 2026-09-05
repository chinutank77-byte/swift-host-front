import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DOMAINS from "@/data/domains.json";

export const metadata = { title: "Domains" };

const statusStyles = {
  operational: "text-success bg-success/10 nm-badge",
  degraded: "text-yellow-500 bg-yellow-50 nm-badge",
  down: "text-danger bg-danger/10 nm-badge",
};

const statusLabels = {
  operational: "Operational",
  degraded: "Degraded",
  down: "Down",
};

export default function DomainsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 py-16">
          <h1 className="text-heading text-[clamp(1.6rem,4vw,2.2rem)] text-text">Available Domains</h1>
          <p className="text-sm text-muted mt-2 mb-8">
            Pick a domain when generating your inbox. All domains are interchangeable.
          </p>

          <div className="glass overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border/30">
              <span className="text-sm font-semibold text-text">Domain list</span>
            </div>

            <table className="w-full">
              <thead>
                <tr className="border-b border-border/20">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Domain</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {DOMAINS.map((d) => (
                  <tr key={d.domain} className="hover:bg-surface/20 transition-colors">
                    <td className="px-5 py-3 text-sm font-mono text-text">{d.domain}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[d.status]}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          d.status === "operational" ? "bg-success" : d.status === "degraded" ? "bg-yellow-500" : "bg-danger"
                        }`} />
                        {statusLabels[d.status]}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted">
                      —
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-sm text-muted mt-6">
            All domains are available for inbox generation. More domains are added regularly.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
