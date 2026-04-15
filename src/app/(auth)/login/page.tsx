"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email ou mot de passe incorrect");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0E0E10]">
      <div className="w-full max-w-md p-8 bg-[#1F1F23] rounded-xl border border-[#2D2D35]">
        <h1 className="text-2xl font-bold text-white mb-2">Connexion</h1>
        <p className="text-[#ADADB8] mb-6 text-sm">
          Content de te revoir sur StreamFlow
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full bg-[#0E0E10] border border-[#2D2D35] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#9146FF]"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-[#9146FF] hover:bg-[#7D2FF7] text-white font-bold rounded-md transition-colors disabled:opacity-50"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-[#ADADB8]">
          Pas encore de compte ?{" "}
          <Link href="/register" className="text-[#9146FF] hover:underline">
            S&apos;inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}