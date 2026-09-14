"use client";

import React from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { MemoryView } from "@/components/memory/MemoryView";

export default function MemoryPage() {
  return (
    <AuthGuard>
      <AppLayout>
        <MemoryView />
      </AppLayout>
    </AuthGuard>
  );
}
