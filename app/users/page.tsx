"use client";
import { signOut } from "next-auth/react";
import React from "react";

export default function Users() {
  return (
    <div>
      <h1 onClick={() => signOut()}>LOgOut</h1>
    </div>
  );
}
