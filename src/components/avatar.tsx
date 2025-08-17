import React from "react";

interface AvatarProps {
  username: string;
  size?: "sm" | "md" | "lg";
}

// Simple utility to generate a deterministic color from a string
function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // GitHub colors palette
  const colors = [
    "#0969da", // blue
    "#2da44e", // green
    "#bf3989", // pink
    "#8250df", // purple
    "#cf222e", // red
    "#bc4c00"  // orange
  ];
  
  // Use the hash to pick a color
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

// Get initials from a username (up to 2 characters)
function getInitials(username: string): string {
  if (!username) return "";
  
  // For GitHub-style usernames, just take the first 2 chars
  return username.substring(0, 2).toUpperCase();
}

export function Avatar({ username, size = "md" }: AvatarProps) {
  const color = stringToColor(username);
  const initials = getInitials(username);
  
  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-10 w-10 text-base",
  };
  
  return (
    <div 
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-medium`}
      style={{ backgroundColor: color }}
      title={username}
    >
      {initials}
    </div>
  );
}