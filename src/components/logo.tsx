import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "dark";
}

export function Logo({ size = "md", variant = "default" }: LogoProps) {
  const sizeClasses = {
    sm: "h-6",
    md: "h-8",
    lg: "h-10",
  };

  const colorClasses = {
    default: "text-primary",
    dark: "text-secondary",
  };

  return (
    <div className="flex items-center gap-2">
      <svg
        className={`${sizeClasses[size]} ${colorClasses[variant]}`}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* GitHub-style Octocat silhouette */}
        <path
          d="M12 2C6.477 2 2 6.477 2 12C2 16.419 4.865 20.166 8.839 21.489C9.339 21.581 9.5 21.278 9.5 21.017C9.5 20.756 9.5 20.117 9.5 19.266C6.739 19.884 6.139 17.966 6.139 17.966C5.699 16.913 5.064 16.622 5.064 16.622C4.192 16.012 5.139 16.023 5.139 16.023C6.102 16.087 6.636 17.025 6.636 17.025C7.5 18.429 8.873 18.014 9.5 17.763C9.595 17.158 9.871 16.745 10.173 16.512C7.976 16.279 5.651 15.458 5.651 11.614C5.651 10.535 6.039 9.648 6.657 8.961C6.553 8.711 6.209 7.739 6.757 6.309C6.757 6.309 7.564 6.042 9.5 7.39C10.294 7.171 11.152 7.061 12 7.057C12.848 7.061 13.707 7.171 14.5 7.389C16.437 6.041 17.242 6.309 17.242 6.309C17.791 7.739 17.447 8.711 17.344 8.962C17.962 9.648 18.348 10.536 18.348 11.615C18.348 15.464 16.018 16.276 13.813 16.501C14.21 16.789 14.563 17.368 14.563 18.258C14.563 19.538 14.55 20.683 14.55 21.015C14.55 21.273 14.706 21.581 15.214 21.488C19.135 20.166 22 16.418 22 12C22 6.477 17.523 2 12 2Z"
          fill="currentColor"
        />
      </svg>
      <span className={`font-bold ${size === "lg" ? "text-xl" : size === "md" ? "text-lg" : "text-base"}`}></span>
    </div>
  );
}