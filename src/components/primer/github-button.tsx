import React from "react";
import { Button as PrimerButton, ThemeProvider } from "@primer/react-brand";

interface GitHubButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "subtle";
  size?: "small" | "medium" | "large";
  icon?: React.ReactNode;
  disabled?: boolean;
  fullWidth?: boolean;
  type?: "button" | "submit" | "reset";
}

export const GitHubButton = ({
  children,
  onClick,
  variant = "primary",
  size = "medium",
  icon,
  disabled = false,
  fullWidth = false,
  type = "button",
}: GitHubButtonProps) => {
  return (
    <ThemeProvider colorMode="light">
      <PrimerButton
        variant={variant}
        size={size}
        onClick={onClick}
        disabled={disabled}
        leadingVisual={icon}
        block={fullWidth}
        type={type}
      >
        {children}
      </PrimerButton>
    </ThemeProvider>
  );
};