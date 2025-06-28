"use client";

import { usePathname } from "next/navigation";

export default function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");
  
  return (
    <main className={`min-h-full ${isDashboard ? 'px-0' : 'px-[15%]'} `}>
      {children}
    </main>
  );
}