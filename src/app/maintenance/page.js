import { Wrench } from "lucide-react";

export default function MaintenancePage() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-screen bg-bg">
      <div className="text-center px-6 max-w-md mx-auto">
        <div className="nm-convex w-20 h-20 mx-auto mb-8 flex items-center justify-center">
          <Wrench size={32} className="text-accent" />
        </div>
        <h1 className="text-heading text-[clamp(1.8rem,4vw,2.4rem)] text-text mb-3">Under Maintenance</h1>
        <p className="text-muted leading-relaxed mb-8">
          We&apos;re making SwiftMail even better. Back shortly.
        </p>
        <div className="nm-concave rounded-xl px-6 py-4 inline-block">
          <span className="text-sm text-text font-mono">support@swiftmail.com</span>
        </div>
      </div>
    </div>
  );
}
