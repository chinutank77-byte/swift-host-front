import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-bg px-6">
      <div className="text-center max-w-md space-y-8">
        <div className="nm-convex w-24 h-24 mx-auto flex items-center justify-center">
          <span className="text-5xl font-bold text-accent hero-title">404</span>
        </div>

        <div>
          <h1 className="text-heading text-[clamp(1.5rem,3vw,2rem)] text-text mb-2">
            Page not found
          </h1>
          <p className="text-muted text-sm leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or was moved.
          </p>
        </div>

        <Link
          href="/"
          className="nm-btn-accent inline-flex items-center gap-2 py-2.5 px-5 text-sm font-medium"
        >
          <Home size={16} />
          Back to homepage
        </Link>
      </div>
    </div>
  );
}
