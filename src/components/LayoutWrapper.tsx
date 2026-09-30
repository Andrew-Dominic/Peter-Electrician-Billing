"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { I18nProvider } from "@/contexts/I18nContext";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <I18nProvider>
      {isLoginPage ? (
        <main className="min-h-screen w-full flex items-center justify-center p-4">
          {children}
        </main>
      ) : (
        <>
          <Sidebar />
          <main className="flex-1 lg:ml-64 p-4 lg:p-8 overflow-auto w-full max-w-[100vw]">
            <div className="max-w-6xl mx-auto w-full">
              {children}
            </div>
          </main>
        </>
      )}
    </I18nProvider>
  );
}
