import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Resend from "next-auth/providers/resend";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { magicLinkEmailHtml } from "@/lib/email-templates";
import { sendEmail } from "@/lib/mailer";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/connexion",
    verifyRequest: "/connexion/verifiez-vos-mails",
  },
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({ identifier: to, url }) {
        await sendEmail({
          to,
          subject: "Ton lien de connexion VA Desk",
          html: magicLinkEmailHtml(url),
          text: `Connecte-toi à VA Desk : ${url}\n\nSi tu n'es pas à l'origine de cette demande, tu peux ignorer cet email.`,
        });
      },
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.password) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        const fullName = [user.name, user.lastName].filter(Boolean).join(" ") || null;

        return {
          id: user.id,
          email: user.email,
          name: fullName,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as "VA" | "CLIENT" | "ADMIN";
      return session;
    },
  },
});
