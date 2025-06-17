import React from "react";
import { Avatar, AvatarPair, Stack, ThemeProvider } from "@primer/react-brand";

interface GitHubAvatarProps {
  src?: string;
  size?: "small" | "medium" | "large" | "xlarge";
  name: string;
  square?: boolean;
  className?: string;
}

export const GitHubAvatar = ({
  src,
  size = "medium",
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

  return (
    <ThemeProvider colorMode="light">
      <div className={className}>
        <Avatar
          src={src}
          size={size}
          square={square}
          alt={`Avatar for ${name}`}
          label={name}
        >
          {!src && getInitials(name)}
        </Avatar>
      </div>
    </ThemeProvider>
  );
};

interface GitHubAvatarPairProps {
  primarySrc?: string;
  secondarySrc?: string;
  primaryName: string;
  secondaryName: string;
  size?: "small" | "medium" | "large" | "xlarge";
  className?: string;
}

export const GitHubAvatarPair = ({
  primarySrc,
  secondarySrc,
  primaryName,
  secondaryName,
  size = "medium",
  className,
}: GitHubAvatarPairProps) => {
  // Generate initial letters from name
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <ThemeProvider colorMode="light">
      <div className={className}>
        <AvatarPair size={size}>
          <Avatar
            src={primarySrc}
            square={false}
            alt={`Avatar for ${primaryName}`}
            label={primaryName}
            size={size}
          >
            {!primarySrc && getInitials(primaryName)}
          </Avatar>
          <Avatar
            src={secondarySrc}
            square={false}
            alt={`Avatar for ${secondaryName}`}
            label={secondaryName}
            size={size}
          >
            {!secondarySrc && getInitials(secondaryName)}
          </Avatar>
        </AvatarPair>
      </div>
    </ThemeProvider>
  );
};