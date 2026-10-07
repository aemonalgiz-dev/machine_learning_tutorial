import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { CourseBreadcrumbs } from "@/components/course/CourseBreadcrumbs";
import { LessonFooter } from "@/components/course/LessonFooter";
import { ProgressPill } from "@/components/site/ProgressPill";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { SupportMessage } from "@/components/site/SupportMessage";
import { lessonLocations, lessonOrder } from "@/lib/course-navigation";
import { REPOSITORY } from "@/lib/site";
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
  title: "oop_ml: machine learning, one concept at a time",
  description:
    "Every concept starts with the problem it was invented to solve, gets an intuitive explanation and a technical one, and comes with an interactive example computed live.",
};

// Restores a reader's choice of the light theme before the page paints. The
// server renders dark, so the common case needs nothing, and a stored choice
// of light is applied here, ahead of any content, rather than after hydration
// where it would flash. Inline because it has to run before the first paint,
// which no bundled script can promise.
const restoreTheme =
  'try{if(localStorage.getItem("oop_ml.theme")==="light")document.documentElement.dataset.theme="light"}catch(e){}';

function LogoMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 text-accent">
      <circle cx="5" cy="12" r="2.4" fill="currentColor" />
      <circle cx="15" cy="5" r="2.4" fill="currentColor" />
      <circle cx="15" cy="19" r="2.4" fill="currentColor" />
      <circle cx="21" cy="12" r="1.8" fill="currentColor" opacity="0.6" />
      <path
        d="M7 11l6-5M7 13l6 5M17 6.5l3 4M17 17.5l3-4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

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
          <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-6 py-3">
            <Link
              href="/"
              className="flex items-center gap-2 font-mono text-base font-bold tracking-tight text-foreground"
            >
              <LogoMark />
              oop_ml
            </Link>
            <div className="hidden items-center gap-5 text-sm text-muted sm:flex">
              <Link href="/#course" className="transition hover:text-foreground">
                Course
              </Link>
              <Link href="/sections/mathematics-as-needed" className="transition hover:text-foreground">
                Primers
              </Link>
              <a
                href={REPOSITORY}
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-foreground"
              >
                Library <span aria-hidden="true">↗</span>
              </a>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <ProgressPill lessons={lessonOrder} />
              <ThemeToggle />
            </div>
            <SupportMessage />
          </nav>
        </header>

        <main className="flex-1">
          <CourseBreadcrumbs locations={lessonLocations} />
          {children}
          <LessonFooter locations={lessonLocations} />
        </main>

        <footer className="border-t border-line">
          <div className="mx-auto max-w-5xl px-6 py-6 text-sm text-muted">
            The examples use NumPy and{" "}
            <a
              href={REPOSITORY}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono font-semibold text-foreground underline-offset-4 hover:underline"
            >
              oop_ml
            </a>
            .
          </div>
        </footer>
      </body>
    </html>
  );
}
