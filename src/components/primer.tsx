import React from "react";
import { X } from "@phosphor-icons/react";

export function PrimerHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="py-4 border-b mb-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
    </header>
  );
}

export function PrimerFooter() {
  const year = new Date().getFullYear();
  
  return (
    <footer className="border-t py-6 text-center text-sm text-muted-foreground">
      <div className="max-w-4xl mx-auto">
        <p>© {year} GitHub, Inc. All rights reserved.</p>
        <p className="mt-2">
          <a href="https://github.com" className="hover:underline">GitHub</a>
          {" • "}
          <a href="https://github.com/pricing" className="hover:underline">Pricing</a>
          {" • "}
          <a href="https://github.com/about" className="hover:underline">About</a>
        </p>
      </div>
    </footer>
  );
}

export function PromoBanner({ 
  message, 
  actionText, 
  actionUrl, 
  onDismiss 
}: { 
  message: string; 
  actionText: string; 
  actionUrl: string; 
  onDismiss: () => void 
}) {
  return (
    <div className="bg-accent text-accent-foreground py-2 px-4 mb-6 rounded-md flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm">{message}</p>
      </div>
      <div className="flex items-center gap-4">
        <a 
          href={actionUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm font-medium hover:underline"
        >
          {actionText}
        </a>
        <button 
          onClick={onDismiss} 
          className="p-1 rounded-full hover:bg-muted/40 text-muted-foreground transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}