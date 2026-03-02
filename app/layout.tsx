import type { Metadata } from "next";
import "../app/globals.css";
import Nav from "@/components/Nav";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Groundfloor — 60-Second Startup Pitches",
  description:
    "Any founder, anywhere. Pitch your idea in 60 seconds. AI-scored. Community-ranked. No gatekeeping.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700;1,800&family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%23e63312'/><text x='50%' y='56%' dominant-baseline='middle' text-anchor='middle' font-family='system-ui' font-weight='900' font-size='13' fill='white'>GF</text></svg>"
        />
      </head>
      <body>
        <Nav />
        <main>{children}</main>
        <footer className="footer">
          <div className="footer__inner">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div className="nav__logo-mark" aria-hidden="true">
                GF
              </div>
              <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>
                Groundfloor
              </span>
              <span
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.75rem",
                  marginLeft: "4px",
                }}
              >
                A living archive of founder ambition.
              </span>
            </div>
            <div className="footer__links">
              <Link href="/info?tab=about">About</Link>
              <Link href="/info?tab=how-it-works">How it works</Link>
              <Link href="/info?tab=privacy">Privacy</Link>
              <Link href="/info?tab=terms">Terms</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
