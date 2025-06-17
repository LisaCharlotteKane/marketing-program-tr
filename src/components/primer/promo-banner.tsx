import React from "react";
import { X } from "@phosphor-icons/react";

interface PromoBannerProps {
  message: string;
  actionText?: string;
  actionUrl?: string;
  onDismiss?: () => void;
}

export const PromoBanner = ({
  message,
  actionText,
  actionUrl,
  onDismiss,
}: PromoBannerProps) => {
  return (
    <div className="w-full bg-accent py-2 px-4 relative">
      <div className="max-w-3xl mx-auto flex items-center justify-center gap-4 flex-wrap">
        <p className="text-accent-foreground text-sm">{message}</p>
        
        {actionText && actionUrl && (
          <a 
            href={actionUrl} 
            target="_blank" 
            rel="noopener"
            className="text-sm font-medium text-primary hover:underline"
          >
            {actionText}
          </a>
        )}
      </div>
      
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};