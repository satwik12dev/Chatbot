"use client";

import React from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { ChatContainer } from "@/components/chat/ChatContainer";

export default function ChatWelcomePage() {
  return (
    <AuthGuard>
      <AppLayout>
        <ChatContainer />
      </AppLayout>
    </AuthGuard>
  );
}
