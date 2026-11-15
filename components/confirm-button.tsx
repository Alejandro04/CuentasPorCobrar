"use client";

import { useTransition } from "react";

export function ConfirmButton({
  action,
  label,
  confirmText,
  className,
}: {
  action: () => Promise<unknown>;
  label: string;
  confirmText: string;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      className={className}
      onClick={() => {
        if (window.confirm(confirmText)) startTransition(() => void action());
      }}
    >
      {label}
    </button>
  );
}
