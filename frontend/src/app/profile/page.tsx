"use client";

import React from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProfileView } from "@/components/settings/ProfileView";

export default function ProfilePage() {
  return (
    <AuthGuard>
      <AppLayout>
        <ProfileView />
      </AppLayout>
    </AuthGuard>
  );
}
