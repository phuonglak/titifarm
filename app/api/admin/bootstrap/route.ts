import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tokenFromQuery = searchParams.get("token");
  const tokenFromHeader = req.headers.get("x-bootstrap-token");
  const providedToken = tokenFromQuery ?? tokenFromHeader ?? undefined;
  const expectedToken = process.env.ADMIN_BOOTSTRAP_TOKEN;

  if (!expectedToken || !providedToken || providedToken !== expectedToken) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 403 });
  }

  const email = searchParams.get("email") ?? "admin@titifarm.com";
  const name = searchParams.get("name") ?? "Admin";

  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: { role: "ADMIN" },
      create: {
        email,
        name,
        role: "ADMIN",
        emailVerified: new Date(),
      },
    });

    return NextResponse.json({ ok: true, userId: user.id, email: user.email, role: user.role });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}

