import React from "react";
import { Logo } from "@/components/logo";
import { ThemeSwitch } from "@/components/theme-switch";
import { Avatar } from "@/components/avatar";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  title: string;
  subtitle: string;
}

export const PrimerHeader = ({ title, subtitle }: HeaderProps) => {
  return (
    <header className="bg-card border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-slate-300">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-1.5 rounded">
              <Logo size="sm" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold">{title}</h1>
              {subtitle && <p className="text-muted-foreground text-xs">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-accent/80 hover:bg-accent text-primary border-accent/20">
              APAC Regional Marketing
            </Badge>
            <ThemeSwitch className="hidden md:block" />
            <div className="h-6 w-px bg-border mx-1 hidden md:block" />
            <Avatar username="gh" size="sm" />
          </div>
        </div>
      </div>
    </header>
  );
};