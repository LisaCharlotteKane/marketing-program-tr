import React from "react";
import { Box, Heading, Stack, Text, ThemeProvider } from "@primer/react-brand";

interface GitHubCardProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  variant?: "default" | "emphasized" | "subtle";
  fullWidth?: boolean;
}

export const GitHubCard = ({
  title,
  description,
  children,
  icon,
  variant = "default",
  fullWidth = false,
}: GitHubCardProps) => {
  const getBorderColor = () => {
    switch (variant) {
      case "emphasized":
        return "border.default";
      case "subtle":
        return "border.subtle";
      default:
        return "border.muted";
    }
  };

  const getBackgroundColor = () => {
    switch (variant) {
      case "emphasized":
        return "bg.emphasis";
      case "subtle":
        return "bg.subtle";
      default:
        return "bg.default";
    }
  };

  return (
    <ThemeProvider colorMode="light">
      <Box
        sx={{
          border: "1px solid",
          borderColor: getBorderColor(),
          borderRadius: 2,
          bg: getBackgroundColor(),
          p: 4,
          width: fullWidth ? "100%" : "auto",
          boxShadow: "shadow.small",
        }}
      >
        <Stack gap={3}>
          <Stack direction="horizontal" gap={2} sx={{ alignItems: "center" }}>
            {icon && (
              <Box sx={{ color: "accent.fg" }}>
                {icon}
              </Box>
            )}
            <Heading as="h3" size="3">
              {title}
            </Heading>
          </Stack>
          
          {description && (
            <Text as="p" size="2" variant="muted">
              {description}
            </Text>
          )}
          
          {children && (
            <Box sx={{ mt: 2 }}>
              {children}
            </Box>
          )}
        </Stack>
      </Box>
    </ThemeProvider>
  );
};