"use client";

type LoadingButtonProps = {
  children: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
};

export function LoadingButton({
  children,
  isLoading = false,
  disabled = false,
  onClick,
  className = "",
}: LoadingButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-3 rounded-full px-6 py-3 transition ${
        disabled || isLoading
          ? "cursor-not-allowed bg-stone-400 text-white"
          : "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)]"
      } ${className}`}
    >
      {isLoading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      )}
      <span>{children}</span>
    </button>
  );
}