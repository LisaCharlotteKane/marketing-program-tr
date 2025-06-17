import React from "react";

interface HeaderProps {
  title: string;
  subtitle: string;
}

export const PrimerHeader = ({ title, subtitle }: HeaderProps) => {
  return (
    <header className="py-6 text-center">
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-muted-foreground">{subtitle}</p>
    </header>
  );
};