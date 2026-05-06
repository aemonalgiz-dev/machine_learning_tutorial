import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
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
    "Every concept starts with the problem it was invented to solve, gets an intuitive explanation and a technical one, and comes with an interactive example computed live by a library written from scratch.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <header className="border-b border-slate-200 dark:border-slate-800">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link
              href="/"
              className="font-mono text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100"
            >
              oop_ml
            </Link>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              learn machine learning by poking it
            </span>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200 dark:border-slate-800">
          <div className="mx-auto max-w-5xl px-6 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Powered by{" "}
            <a
              href="https://github.com/aemonalgiz-dev/oop_ml"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono font-semibold text-slate-700 underline-offset-4 hover:text-indigo-600 hover:underline dark:text-slate-300 dark:hover:text-indigo-400"
            >
              oop_ml
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
