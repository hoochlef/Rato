"use client";

import Link from "next/link";
import Image from "next/image";
import AuthDialog from "./auth-dialog";
import UserMenu from "./user-menu";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";

export default function Header() {
  const { user, loading } = useAuth();

  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  if (isDashboard) {
    return null;
  }

  return (
    <header className="h-17 border-b bg-white flex px-[5%] md:px-[15%] justify-between items-center py-2">
      <Link href="/">
        <Image src="/site_logo_4.svg" alt="Logo" width={120} height={20} />
      </Link>
      {!loading && (user ? <UserMenu /> : <AuthDialog />)}
    </header>
  );
}
