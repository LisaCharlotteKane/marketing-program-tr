import React from "react";

export const PrimerFooter = () => {
  return (
    <footer className="py-6 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} GitHub, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <a href="https://github.com/about" target="_blank" rel="noopener" className="hover:text-foreground transition-colors">About</a>
            <a href="https://github.com/pricing" target="_blank" rel="noopener" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="https://github.com/enterprise" target="_blank" rel="noopener" className="hover:text-foreground transition-colors">Enterprise</a>
            <a href="https://github.com/support" target="_blank" rel="noopener" className="hover:text-foreground transition-colors">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
};