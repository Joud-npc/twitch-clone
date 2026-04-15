import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Regex plus robuste : vérifie l'existence d'une extension de 2 à 6 lettres (ex: .online, .fr, .com)
const STRICT_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

export async function POST(req: NextRequest) {
  try {
    const { username, email, password } = await req.json();

    // Nettoyage des données (supprime les espaces inutiles)
    const cleanEmail = email?.toLowerCase().trim();
    const cleanUsername = username?.trim();

    // 1. Validation de base
    if (!cleanUsername || !cleanEmail || !password) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }

    // 2. Validation stricte du format
    if (!STRICT_EMAIL_REGEX.test(cleanEmail)) {
      return NextResponse.json({ error: "L'adresse email n'est pas valide" }, { status: 400 });
    }

    // 3. Validation de la complexité du mot de passe
    if (password.length < 8) {
      return NextResponse.json({ error: "8 caractères minimum pour le mot de passe" }, { status: 400 });
    }

    // 4. Vérification d'unicité en une seule requête
    const userExists = await prisma.user.findFirst({
      where: { OR: [{ email: cleanEmail }, { username: cleanUsername }] }
    });

    if (userExists) {
      const field = userExists.email === cleanEmail ? "Cet email" : "Ce nom d'utilisateur";
      return NextResponse.json({ error: `${field} est déjà utilisé` }, { status: 409 });
    }

    // 5. Hachage sécurisé
    const hashedPassword = await bcrypt.hash(password, 12);

    // 6. Création sécurisée (on ne renvoie JAMAIS le password)
    const newUser = await prisma.user.create({
      data: {
        username: cleanUsername,
        email: cleanEmail,
        password: hashedPassword,
      },
      select: { id: true, username: true, email: true }
    });

    return NextResponse.json({ message: "Utilisateur créé", user: newUser }, { status: 201 });

  } catch (error) {
    console.error("Critical Register Error:", error);
    return NextResponse.json({ error: "Une erreur interne est survenue" }, { status: 500 });
  }
}