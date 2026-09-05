import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { InboxProvider } from "@/components/providers/InboxProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import SiteGate from "@/components/shared/SiteGate";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const baseUrl = process.env.SITE_URL || "https://swiftmail.vercel.app";

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "SwiftMail · Disposable Email, Instantly",
    template: "%s · SwiftMail",
  },
  description:
    "The fastest inbox you'll ever delete. No signup. No credit card. Generate a disposable email in milliseconds.",
  icons: {
    icon: "/swiftmail1.png",
  },
  openGraph: {
    title: "SwiftMail · Disposable Email, Instantly",
    description:
      "The fastest inbox you'll ever delete. No signup. No credit card. Generate a disposable email in milliseconds.",
    siteName: "SwiftMail",
    type: "website",
    images: [{ url: "/swiftmail1.png", width: 512, height: 512 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SwiftMail · Disposable Email, Instantly",
    description:
      "The fastest inbox you'll ever delete. No signup, no credit card.",
    images: ["/swiftmail1.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${jakarta.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  if (saved === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (_) {}
                window.__TURNSTILE_SITE_KEY__ = "${process.env.TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}";
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-bg text-text">
        <SiteGate />
        <AuthProvider>
          <InboxProvider>
            {children}
            <Toaster position="bottom-right" richColors />
          </InboxProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
