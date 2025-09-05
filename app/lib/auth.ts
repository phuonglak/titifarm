import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/app/lib/prisma";
import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";

const emailServer = process.env.EMAIL_SERVER;
const emailFrom = process.env.EMAIL_FROM;

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database",
  },
  providers: [
    ...(emailServer && emailFrom
      ? [
          EmailProvider({
            server: emailServer,
            from: emailFrom,
          }),
        ]
      : []),
  ],
};


