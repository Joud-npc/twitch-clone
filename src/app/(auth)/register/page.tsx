"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const data = {
      username: (form.elements.namedItem("username") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      password: (form.elements.namedItem("password") as HTMLInputElement).value,
    };

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(json.error || "Erreur lors de l'inscription");
      return;
    }

    router.push("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0E0E10]">
      <div className="w-full max-w-md p-8 bg-[#1F1F23] rounded-xl border border-[#2D2D35]">
        <h1 className="text-2xl font-bold text-white mb-2">Créer un compte</h1>
        <p className="text-[#ADADB8] mb-6 text-sm">
          Rejoins la communauté StreamFlow
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[#ADADB8] mb-1">
              Nom d&apos;utilisateur
            </label>
            <input
              name="username"
              type="text"
              required
              minLength={3}
              className="w-full bg-[#0E0E10] border border-[#2D2D35] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#9146FF]"
            />
          </div>
          <div>
            <label className="block text-sm text-[#ADADB8] mb-1">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full bg-[#0E0E10] border border-[#2D2D35] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#9146FF]"
            />
          </div>
          <div>
            <label className="block text-sm text-[#ADADB8] mb-1">
              Mot de passe
            </label>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              className="w-full bg-[#0E0E10] border border-[#2D2D35] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#9146FF]"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-[#9146FF] hover:bg-[#7D2FF7] text-white font-bold rounded-md transition-colors disabled:opacity-50"
          >
            {loading ? "Création..." : "S'inscrire"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-[#ADADB8]">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-[#9146FF] hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}