import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/email-confirme?status=erreur", req.url));
  }

  const record = await prisma.verificationToken.findUnique({ where: { token } });

  if (!record || record.expires < new Date()) {
    return NextResponse.redirect(new URL("/email-confirme?status=erreur", req.url));
  }

  await prisma.verificationToken.delete({ where: { token } });
  await prisma.user.update({
    where: { email: record.identifier },
    data: { emailVerified: new Date() },
  });

  return NextResponse.redirect(new URL("/email-confirme?status=ok", req.url));
}
