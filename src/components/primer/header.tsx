import React from "react";
import { Box, Grid, Hero, Heading, Text, ThemeProvider } from "@primer/react-brand";

interface HeaderProps {
  title: string;
  subtitle: string;
}

export const PrimerHeader = ({ title, subtitle }: HeaderProps) => {
  return (
    <ThemeProvider colorMode="light">
      <Hero>
        <Grid>
          <Box
            sx={{
              textAlign: "center",
              padding: "24px 0",
              width: "100%",
            }}
          >
            <Heading as="h1" size="3" sx={{ mb: 2 }}>
              {title}
            </Heading>
            <Text as="p" size="3" variant="muted">
              {subtitle}
            </Text>
          </Box>
        </Grid>
      </Hero>
    </ThemeProvider>
  );
};