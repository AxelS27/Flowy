import React, { FC, ReactNode } from "react";
import { sound } from "../utils/soundEffects";

export interface PushButtonProps {
  children: ReactNode;
  variant?: "strawberry" | "mint" | "sunny" | "blueberry" | "grape" | "ghost" | "slate";
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  disabled?: boolean;
  title?: string;
}

const variantStyles: Record<string, string> = {
  strawberry:
    "bg-strawberry text-white border-2 border-strawberry-dark shadow-tactile-strawberry hover:brightness-105 active:shadow-[0_1px_0_#E03B6B]",
  mint:
    "bg-mint text-white border-2 border-mint-dark shadow-tactile-mint hover:brightness-105 active:shadow-[0_1px_0_#14B8A6]",
  sunny:
    "bg-sunny text-slate-900 border-2 border-sunny-dark shadow-tactile-sunny hover:brightness-105 active:shadow-[0_1px_0_#E5A817]",
  blueberry:
    "bg-blueberry text-white border-2 border-blueberry-dark shadow-tactile-blueberry hover:brightness-105 active:shadow-[0_1px_0_#3B82F6]",
  grape:
    "bg-grape text-white border-2 border-grape-dark shadow-tactile-grape hover:brightness-105 active:shadow-[0_1px_0_#A855F7]",
  slate:
    "bg-slate-700 text-white border-2 border-slate-900 shadow-[0_5px_0_#0F172A] hover:bg-slate-600 active:shadow-[0_1px_0_#0F172A]",
  ghost:
    "bg-white text-ink border-2 border-cream-border shadow-[0_4px_0_#EDE7DE] hover:bg-cream active:shadow-[0_1px_0_#EDE7DE]",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-xs rounded-xl font-bold gap-1.5",
  md: "px-5 py-2.5 text-sm rounded-2xl font-extrabold gap-2",
  lg: "px-7 py-3.5 text-base rounded-2xl font-black gap-2.5",
};

export const PushButton: FC<PushButtonProps> = ({
  children,
  variant = "mint",
  size = "md",
  icon,
  onClick,
  className = "",
  disabled = false,
  title,
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    sound.playPop(variant === "strawberry" ? 560 : variant === "sunny" ? 640 : 480);
    onClick?.(e);
  };

  return (
    <button
      title={title}
      disabled={disabled}
      onClick={handleClick}
      className={`
        relative inline-flex items-center justify-center select-none cursor-pointer
        transition-all duration-75 active:translate-y-[4px]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
