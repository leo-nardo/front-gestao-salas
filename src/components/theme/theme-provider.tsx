"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect, type PropsWithChildren } from "react";
import { hydrateThemeSettings } from "@/stores/theme-store";

function ThemeProvider(props: PropsWithChildren) {
  useEffect(() => {
    hydrateThemeSettings();
  }, []);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {props.children}
    </NextThemesProvider>
  );
}

export default ThemeProvider;
