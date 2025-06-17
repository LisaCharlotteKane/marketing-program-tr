import React from "react";

// Simple GitHub-styled footer component
export function PrimerFooter() {
  return (
    <footer className="border-t pt-6 pb-8 text-center text-sm text-muted-foreground">
      <div className="flex flex-col items-center justify-center space-y-2">
        <div className="flex items-center space-x-1">
          <span>© {new Date().getFullYear()} GitHub, Inc.</span>
        </div>
        <div className="flex items-center space-x-4">
          <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
          <a href="#" className="hover:text-foreground transition-colors">Security</a>
          <a href="#" className="hover:text-foreground transition-colors">Status</a>
          <a href="#" className="hover:text-foreground transition-colors">Help</a>
        </div>
      </div>
    </footer>
  );
}