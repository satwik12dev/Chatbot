import React from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { ChatContainer } from "@/components/chat/ChatContainer";

interface ChatConversationPageProps {
  params: Promise<{
    conversationId: string;
  }>;
}

export default async function ChatConversationPage({
  params,
}: ChatConversationPageProps) {
  const resolvedParams = await params;

  return (
    <AuthGuard>
      <AppLayout>
        <ChatContainer conversationId={resolvedParams.conversationId} />
      </AppLayout>
    </AuthGuard>
  );
}
