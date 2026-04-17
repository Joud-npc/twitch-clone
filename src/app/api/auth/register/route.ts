import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { isEmail } from "validator";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { username, email, password } = await req.json();

    const cleanEmail = email?.toLowerCase().trim();
    const cleanUsername = username?.trim();

    if (!cleanUsername || !cleanEmail || !password) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }

    // Validation avec validator.js — bien plus fiable qu'une regex
    if (!isEmail(cleanEmail)) {
      return NextResponse.json({ error: "L'adresse email n'est pas valide" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "8 caractères minimum pour le mot de passe" }, { status: 400 });
    }

    const userExists = await prisma.user.findFirst({
      where: { OR: [{ email: cleanEmail }, { username: cleanUsername }] }
    });

    if (userExists) {
      const field = userExists.email === cleanEmail ? "Cet email" : "Ce nom d'utilisateur";
      return NextResponse.json({ error: `${field} est déjà utilisé` }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

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