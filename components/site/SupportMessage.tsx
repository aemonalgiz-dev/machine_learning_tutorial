import { PATREON_URL } from "@/lib/site";

export function SupportMessage() {
  const message = (
    <>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="h-4 w-4 shrink-0"
      >
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
      </svg>
      <span>Help support keeping this website free.</span>
    </>
  );

  return (
    <div className="flex w-full justify-end border-t border-line pt-2 text-xs text-accent lg:w-auto lg:border-0 lg:pt-0">
      {PATREON_URL ? (
        <a
          href={PATREON_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-sm underline-offset-4 hover:underline"
        >
          {message}
        </a>
      ) : (
        <span className="inline-flex items-center gap-2">{message}</span>
      )}
    </div>
  );
}
