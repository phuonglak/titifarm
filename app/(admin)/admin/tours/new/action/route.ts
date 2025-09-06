import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { promises as fs } from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const title = String(form.get("title") ?? "");
  const description = String(form.get("description") ?? "");
  const slug = String(form.get("slug") ?? "");
  const basePrice = Number(form.get("basePrice") ?? 0);
  const file = form.get("imageFile") as File | null;

  if (!title || !description || !slug || !Number.isFinite(basePrice) || !file) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  // Save file: on Vercel (serverless) we cannot persist to public dir.
  // Fall back to data URL when VERCEL env is present; otherwise write to /public/uploads for local dev.
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  let publicUrl: string;
  if (process.env.VERCEL) {
    const ext = (path.extname(file.name) || ".png").toLowerCase();
    const contentType = file.type || (ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : ext === ".png" ? "image/png" : "application/octet-stream");
    const base64 = buffer.toString("base64");
    publicUrl = `data:${contentType};base64,${base64}`;
  } else {
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });
    const ext = path.extname(file.name) || ".png";
    const filename = `${slug}-${Date.now()}${ext}`;
    const filepath = path.join(uploadDir, filename);
    await fs.writeFile(filepath, buffer);
    publicUrl = `/uploads/${filename}`;
  }

  // Ensure a default destination exists (TitiFarm)
  const defaultDest = await prisma.destination.upsert({
    where: { slug: "titifarm" },
    update: {},
    create: { slug: "titifarm", name: "TitiFarm" },
  });

  await prisma.tour.create({
    data: {
      title,
      description,
      slug,
      basePrice,
      destinationId: defaultDest.id,
      images: { create: [{ url: publicUrl, sortOrder: 0 }] },
    },
  });

  return NextResponse.redirect(new URL("/admin/tours", req.url));
}


