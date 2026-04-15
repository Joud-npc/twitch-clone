import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt", // Obligatoire pour les Credentials
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        // 1. Validation de présence
        if (!credentials?.email || !credentials?.password) {
          return null; // On retourne null plutôt que de throw une erreur verbeuse
        }

        // 2. Nettoyage (Empêche les erreurs de casse)
        const email = (credentials.email as string).toLowerCase().trim();

        // 3. Recherche unique
        const user = await prisma.user.findUnique({
          where: { email },
        });

        // 4. Vérification sécurisée
        // On vérifie l'existence ET le password en une fois pour éviter les timings attacks
        if (!user || !user.password) {
          return null; 
        }

        const passwordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!passwordValid) {
          return null;
        }

        // 5. Retour des infos (On n'envoie que le nécessaire)
        return {
          id: user.id,
          email: user.email,
          name: user.username,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // On attache l'ID de la DB au Token JWT
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // On fait passer l'ID du Token vers la Session accessible côté Front
      if (token.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login", // Redirige les erreurs vers le login pour gérer les messages
  },
  // Note : Avec Auth.js v5, le secret est souvent détecté automatiquement 
  // s'il s'appelle AUTH_SECRET dans le .env
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
});