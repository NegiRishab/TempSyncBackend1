"use client";

import { SessionProvider } from "next-auth/react";

interface AuthContextPops {
  children: React.ReactNode;
}
export default function AuthContext({ children }: AuthContextPops) {
  return <SessionProvider>{children}</SessionProvider>;
}
