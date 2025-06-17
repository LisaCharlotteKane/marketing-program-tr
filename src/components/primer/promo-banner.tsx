import React from "react";
import { Box, Button, InlineLink, Stack, Text, ThemeProvider } from "@primer/react-brand";

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
    <ThemeProvider colorMode="light">
      <Box
        sx={{
          bg: "accent.default",
          py: 1,
          px: 6,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
        }}
      >
        <Stack
          direction="horizontal"
          gap={3}
          sx={{
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            maxWidth: "900px",
          }}
        >
          <Text as="p" size="300" variant="default">
            {message}
          </Text>
          
          {actionText && actionUrl && (
            <InlineLink href={actionUrl} target="_blank">
              {actionText}
            </InlineLink>
          )}
        </Stack>
        
        {onDismiss && (
          <Button
            variant="invisible"
            size="small"
            onClick={onDismiss}
            sx={{
              position: "absolute",
              right: 3,
              top: "50%",
              transform: "translateY(-50%)",
              color: "fg.subtle",
            }}
          >
            ✕
          </Button>
        )}
      </Box>
    </ThemeProvider>
  );
};