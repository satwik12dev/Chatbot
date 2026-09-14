"use client";

import React from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { SettingsView } from "@/components/settings/SettingsView";

export default function SettingsPage() {
  return (
    <AuthGuard>
      <AppLayout>
        <SettingsView />
      </AppLayout>
    </AuthGuard>
  );
}
