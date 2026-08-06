import AuthProvider from "@/services/auth/auth-provider";
import "../globals.css";
import { Public_Sans, IBM_Plex_Mono } from "next/font/google";
import { dir } from "i18next";
import { DirectionProvider } from "@radix-ui/react-direction";
import "@/services/i18n/config";
import { languages } from "@/services/i18n/config";
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import StoreLanguageProvider from "@/services/i18n/store-language-provider";
import ThemeProvider from "@/components/theme/theme-provider";
import LeavePageProvider from "@/services/leave-page/leave-page-provider";
import QueryClientProvider from "@/services/react-query/query-client-provider";
import queryClient from "@/services/react-query/query-client";
import ReactQueryDevtools from "@/services/react-query/react-query-devtools";
import ConfirmDialogProvider from "@/components/confirm-dialog/confirm-dialog-provider";

const publicSans = Public_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-mono",
});

type Props = {
  params: Promise<{ language: string }>;
};

export async function generateMetadata(_props: Props): Promise<Metadata> {
  return {
    title: "Ambienta — Gestão de Espaços Acadêmicos",
  };
}

export function generateStaticParams() {
  return languages.map((language) => ({ language }));
}

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ language: string }>;
}) {
  const params = await props.params;

  const { language } = params;

  const { children } = props;

  return (
    <html
      lang={language}
      dir={dir(language)}
      suppressHydrationWarning
      className={`${publicSans.variable} ${ibmPlexMono.variable}`}
    >
      <body suppressHydrationWarning className="font-sans antialiased">
        <DirectionProvider dir={dir(language)}>
          <QueryClientProvider client={queryClient}>
            <ReactQueryDevtools initialIsOpen={false} />
            <ThemeProvider>
              <StoreLanguageProvider>
                <ConfirmDialogProvider>
                  <AuthProvider>
                    <LeavePageProvider>
                      {children}
                      <Toaster />
                    </LeavePageProvider>
                  </AuthProvider>
                </ConfirmDialogProvider>
              </StoreLanguageProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </DirectionProvider>
      </body>
    </html>
  );
}
