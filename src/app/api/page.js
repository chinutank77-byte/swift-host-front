import { Code, ExternalLink } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function ApiPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 py-24 text-center">
          <div className="nm-icon-circle w-16 h-16 mx-auto mb-6 text-accent">
            <Code size={28} />
          </div>
          <h1 className="text-heading text-[clamp(2rem,4vw,3rem)] text-text mb-4">API</h1>
          <p className="text-base text-muted max-w-lg mx-auto leading-relaxed mb-8">
            Base URL: <code className="font-mono text-accent">https://api.swiftinbox.xyz</code>
          </p>
          <div className="flex items-center justify-center gap-3">
            <a
              href="/docs"
              className="nm-btn-accent inline-flex items-center gap-2 py-2.5 px-5 text-sm font-medium"
            >
              Read the docs
              <ExternalLink size={14} />
            </a>
            <a
              href="/dashboard/api-keys"
              className="nm-btn inline-flex items-center gap-2 py-2.5 px-5 text-sm font-medium text-text"
            >
              Get API key
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
