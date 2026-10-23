import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { CourseBreadcrumbs } from "@/components/course/CourseBreadcrumbs";
import { LessonFooter } from "@/components/course/LessonFooter";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { AccountSync } from "@/components/site/AccountSync";
import { SupportMessage } from "@/components/site/SupportMessage";
import { Botie } from "@/components/site/Botie";
import { REPOSITORY, SITE_NAME, SITE_ORIGIN, SITE_TITLE, SITE_DESCRIPTION, SITE_SOCIAL } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  applicationName: SITE_NAME,
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: SITE_SOCIAL,
  twitter: { card: "summary_large_image" },
};

// Restores a reader's choice of the light theme before the page paints. The
// server renders dark, so the common case needs nothing, and a stored choice
// of light is applied here, ahead of any content, rather than after hydration
// where it would flash. Inline because it has to run before the first paint,
// which no bundled script can promise.
const restoreTheme =
  'try{if(localStorage.getItem("oop_ml.theme")==="light")document.documentElement.dataset.theme="light"}catch(e){}';

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <script dangerouslySetInnerHTML={{ __html: restoreTheme }} />

        <header className="sticky top-0 z-40 border-b border-line bg-background/85 backdrop-blur">
          <nav aria-label="Main navigation" className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-5 gap-y-2 px-6 py-3">
            <Link
              href="/"
              className="flex items-center gap-2 font-mono text-base font-bold tracking-tight text-foreground"
            >
              <Botie size={32} decorative />
              {SITE_NAME}
            </Link>
            <div className="order-3 flex w-full flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted sm:order-none sm:w-auto">
              <Link href="/#course" className="transition hover:text-foreground">
                Learn
              </Link>
              <Link href="/lab" className="inline-flex min-h-9 items-center transition hover:text-foreground">
                Workshops
              </Link>
              <Link href="/search" className="inline-flex min-h-9 items-center transition hover:text-foreground">Search</Link>
              <Link href="/practice" className="inline-flex min-h-9 items-center transition hover:text-foreground">Practice</Link>
              <Link href="/about" className="inline-flex min-h-9 items-center transition hover:text-foreground">About</Link>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <AccountSync />
              <ThemeToggle />
            </div>
          </nav>
        </header>

        <main className="flex-1">
          <CourseBreadcrumbs />
          {children}
          <LessonFooter />
        </main>

        <footer className="border-t border-line">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-6 text-sm text-muted">
            <p>The examples use NumPy and{" "}
            <a
              href={REPOSITORY}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono font-semibold text-foreground underline-offset-4 hover:underline"
            >
              oop_ml
            </a>
            .</p>
            <Link href="/privacy" className="underline-offset-4 hover:underline">
              Privacy
            </Link>
            <SupportMessage />
          </div>
        </footer>
      </body>
    </html>
  );
}
