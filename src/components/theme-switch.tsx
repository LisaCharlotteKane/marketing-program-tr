import React from "react";
import { Sun, Moon } from "@phosphor-icons/react";

interface ThemeSwitchProps {
  className?: string;
}

export function ThemeSwitch({ className = "" }: ThemeSwitchProps) {
  // This is just a UI element for now, not actually functional
  // In a real app, you'd implement theme switching logic
  
  return (
    <button 
      className={`rounded-md p-2 hover:bg-muted/50 transition-colors ${className}`}
      title="Toggle theme (UI only)"
      aria-label="Toggle theme"
    >
      <Sun className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}