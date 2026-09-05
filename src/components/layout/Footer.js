import Link from "next/link";

const footerLinks = [
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
  { href: "/domains", label: "Domains" },
  { href: "#", label: "Privacy" },
  { href: "#", label: "Terms" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link href="/" className="text-sm font-semibold text-text tracking-tight hero-title">
          SwiftMail
        </Link>

        <nav className="flex items-center gap-4">
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-muted hover:text-text transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <span className="text-sm text-muted">© 2025 SwiftMail</span>
      </div>
    </footer>
  );
}
