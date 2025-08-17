import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface GitHubAvatarProps {
  src?: string;
  size?: "sm" | "md" | "lg" | "xl";
  name: string;
  square?: boolean;
  className?: string;
}

export const GitHubAvatar = ({
  src,
  size = "md",
  name,
  square = false,
  className,
}: GitHubAvatarProps) => {
  // Generate initial letters from name
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16"
  };

  return (
    <Avatar className={cn(
      sizeClasses[size], 
      square ? "rounded-md" : "rounded-full",
      className
    )}>
      <AvatarImage src={src} alt={`Avatar for ${name}`} />
      <AvatarFallback>{getInitials(name)}</AvatarFallback>
    </Avatar>
  );
};

interface GitHubAvatarPairProps {
  primarySrc?: string;
  secondarySrc?: string;
  primaryName: string;
  secondaryName: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const GitHubAvatarPair = ({
  primarySrc,
  secondarySrc,
  primaryName,
  secondaryName,
  size = "md",
  className,
}: GitHubAvatarPairProps) => {
  return (
    <div className={cn("relative inline-flex", className)}>
      <GitHubAvatar 
        src={primarySrc} 
        name={primaryName} 
        size={size} 
        className="relative z-10"
      />
      <GitHubAvatar 
        src={secondarySrc} 
        name={secondaryName} 
        size={size} 
        className="-ml-3 relative z-0 border-2 border-background"
      />
    </div>
  );
};