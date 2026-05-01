import { Volume2 } from "lucide-react";

interface ReplayButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function ReplayButton({ onClick, disabled }: ReplayButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2 px-4 py-2 rounded-md text-ink hover:text-ink/80 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Volume2 size={20} />
      <span>重听</span>
    </button>
  );
}
