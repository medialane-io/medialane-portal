"use client";

export const ACTION_GRADIENTS: Record<string, [string, string, string]> = {
  buy: ["#3b7bff", "#8a5cf6", "#3b7bff"],
  submit: ["#d6359a", "#5b4ce6", "#d6359a"],
  offer: ["#f6608f", "#fb8b46", "#f6608f"],
  remix: ["#8a5cf6", "#f6608f", "#8a5cf6"],
  license: ["#3b7bff", "#5b4ce6", "#3b7bff"],
};
export const ACTION_FOREGROUNDS: Record<string, string> = {
  buy: "#3b7bff",
  submit: "#5b4ce6",
  offer: "#fb7a32",
  remix: "#8a3ff0",
  license: "#3b7bff",
};

export function TrustNote({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 text-[11px] leading-relaxed text-muted-foreground ${center ? "justify-center" : ""}`}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
        <path d="M12 2l7 4v6c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6z" />
      </svg>
      <span>{children}</span>
    </div>
  );
}
