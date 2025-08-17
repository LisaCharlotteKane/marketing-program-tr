import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GitHubButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  icon?: React.ReactNode;
  disabled?: boolean;
  fullWidth?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
}

export const GitHubButton = ({
  children,
  onClick,
  variant = "default",
  size = "default",
  icon,
  disabled = false,
  fullWidth = false,
  type = "button",
  className
}: GitHubButtonProps) => {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={cn(fullWidth && "w-full", className)}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </Button>
  );
};