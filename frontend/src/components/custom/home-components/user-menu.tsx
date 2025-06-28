// components/UserMenu.tsx
"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function UserMenu() {
  const { user, loading } = useAuth();
  if (loading || !user) return null;

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.reload();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-10 h-10 p-0 rounded-full cursor-pointer">
          <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center uppercase font-bold text-white">
            {user.username?.[0] || "U"}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="p-4 border-b">
          <p className="font-semibold">{user.username}</p>
          <p className="text-sm text-gray-600">{user.email}</p>
        </div>
        <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer">
          Déconnexion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
