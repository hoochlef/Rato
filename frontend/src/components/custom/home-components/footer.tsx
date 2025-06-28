"use client";

import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  if (isDashboard) {
    return null;
  }

  return (
    <footer className="flex h-17 border-t bg-white px-[15%] items-center justify-center mt-10">
      <p className="text-[#939393]">©2025 Rato. Tous droits réservés.</p>
    </footer>
  );
}
