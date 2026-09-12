"use client";

export function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <button
      onClick={onBack}
      aria-label="Back"
      className="glass grid h-10 w-10 place-items-center rounded-full text-foreground"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  );
}
