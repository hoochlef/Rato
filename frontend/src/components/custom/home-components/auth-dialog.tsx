"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent } from "@/components/ui/tabs";

export default function AuthDialog() {
  const [open, setOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      setOpen(false);
      window.location.reload();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Client-side validation
    if (username.length < 3 || username.length > 20) {
      setError("Le nom d'utilisateur doit contenir entre 3 et 20 caractères");
      setIsLoading(false);
      return;
    }

    if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email)) {
      setError("Veuillez entrer une adresse email valide");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      setIsLoading(false);
      return;
    }

    const userData = { username, email, password };

    try {
      const res = await fetch("http://127.0.0.1:8000/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Signup failed");
      }

      const loginFormData = new FormData();
      loginFormData.append("username", userData.email || "");
      loginFormData.append("password", userData.password || "");

      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        body: loginFormData,
      });

      if (!loginRes.ok) {
        throw new Error("Login failed after signup");
      }

      setOpen(false);
      window.location.reload();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="uppercase font-bold text-[#939393] hover:text-gray-600 transition duration-300 border px-6 py-3 rounded-sm cursor-pointer">
          Se connecter
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="sr-only">Bienvenue à Rato</DialogTitle>
        </DialogHeader>
        <Tabs
          defaultValue="login"
          className="w-full"
          value={authMode}
          onValueChange={setAuthMode}
        >
          <TabsContent value="login">
            <h3 className="text-2xl text-center font-semibold mb-5">
              Connectez-vous à Rato
            </h3>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                id="email"
                name="username"
                required
                className="w-full border px-3 py-2 rounded"
              />
              <input
                type="password"
                placeholder="Mot de passe"
                id="password"
                name="password"
                required
                className="w-full border px-3 py-2 rounded"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-500 text-white py-2 rounded cursor-pointer disabled:bg-blue-300"
              >
                {isLoading ? "Chargement..." : "Connexion"}
              </button>
            </form>
            <p className="text-sm text-center mt-4">
              Pas encore de compte ?{" "}
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signup");
                  setError("");
                }}
                className="text-blue-600 hover:underline cursor-pointer"
              >
                Inscrivez-vous
              </button>
            </p>
          </TabsContent>

          <TabsContent value="signup">
            <h3 className="text-2xl text-center font-semibold mb-5">
              Créez votre compte Rato
            </h3>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleSignup} className="space-y-4">
              <input
                type="text"
                placeholder="Nom d'utilisateur"
                name="username"
                minLength={3}
                maxLength={20}
                pattern="[a-zA-Z0-9._-]+"
                title="Les caractères spéciaux ne sont pas autorisés"
                required
                className="w-full border px-3 py-2 rounded"
              />
              <input
                type="email"
                placeholder="Email"
                name="email"
                required
                pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                className="w-full border px-3 py-2 rounded"
              />
              <input
                type="password"
                placeholder="Mot de passe"
                name="password"
                minLength={8}
                required
                className="w-full border px-3 py-2 rounded"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-500 text-white py-2 rounded cursor-pointer disabled:bg-blue-300"
              >
                {isLoading ? "Chargement..." : "Inscription"}
              </button>
            </form>
            <p className="text-sm text-center mt-4 ">
              Vous avez déjà un compte ?{" "}
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setError("");
                }}
                className="text-blue-600 hover:underline cursor-pointer"
              >
                Connectez-vous
              </button>
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
