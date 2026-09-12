"use client";

import { ACTION_GRADIENTS, ACTION_FOREGROUNDS } from "./action-button";

export function QuickAction({
  label,
  icon,
  action,
  onClick,
  disabled,
}: {
  label: string;
  icon: React.ReactNode;
  action: keyof typeof ACTION_GRADIENTS;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const grad = `linear-gradient(115deg, ${ACTION_GRADIENTS[action].join(",")})`;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group flex flex-col items-center gap-1.5 ${disabled ? "pointer-events-none opacity-40" : ""}`}
    >
      <span
        className="ml-gbtn relative grid h-12 w-12 place-items-center rounded-[15px] bg-transparent transition-transform group-active:scale-95"
        style={{ "--ml-grad": grad, color: ACTION_FOREGROUNDS[action] } as React.CSSProperties}
      >
        {icon}
      </span>
      <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
    </button>
  );
}
