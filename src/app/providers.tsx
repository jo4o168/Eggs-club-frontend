"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { ReactNode, useState } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProducerWorkspaceGuard } from "@/components/ProducerWorkspaceGuard";
import { Toaster } from "@/components/ui/toaster";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ProducerWorkspaceGuard />
          {children}
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
