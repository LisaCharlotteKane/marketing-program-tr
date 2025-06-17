import React from "react";
import { Box, Footer, Grid, Link, Text, ThemeProvider } from "@primer/react-brand";

export const PrimerFooter = () => {
  return (
    <ThemeProvider colorMode="light">
      <Footer>
        <Grid>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px 0",
              width: "100%",
            }}
          >
            <Text as="p" size="1" variant="muted">
              &copy; {new Date().getFullYear()} GitHub, Inc. All rights reserved.
            </Text>
            <Box sx={{ display: "flex", gap: 3, marginTop: 2 }}>
              <Link href="https://github.com/about" target="_blank">About</Link>
              <Link href="https://github.com/pricing" target="_blank">Pricing</Link>
              <Link href="https://github.com/enterprise" target="_blank">Enterprise</Link>
              <Link href="https://github.com/support" target="_blank">Support</Link>
            </Box>
          </Box>
        </Grid>
      </Footer>
    </ThemeProvider>
  );
};