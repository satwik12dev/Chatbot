import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Composer } from "@/components/chat/Composer";
import { CodeBlock } from "@/components/chat/CodeBlock";
import { UserMessage } from "@/components/chat/UserMessage";
import { ChatMessageResponse } from "@/types/api";

describe("Chat Components", () => {
  it("renders Composer and enables Send button only when text is entered", () => {
    const onSendMessage = vi.fn();
    const onStopStreaming = vi.fn();

    render(
      <Composer
        onSendMessage={onSendMessage}
        isStreaming={false}
        onStopStreaming={onStopStreaming}
      />
    );

    const textarea = screen.getByPlaceholderText("Message AVA...");
    const sendButton = screen.getByRole("button", { name: /send message/i });

    // Initially disabled
    expect(sendButton).toBeDisabled();

    // Type text
    fireEvent.change(textarea, { target: { value: "Hello AVA!" } });
    expect(sendButton).not.toBeDisabled();

    // Click Send
    fireEvent.click(sendButton);
    expect(onSendMessage).toHaveBeenCalledWith("Hello AVA!");
  });

  it("shows Stop generating button when streaming is active", () => {
    const onSendMessage = vi.fn();
    const onStopStreaming = vi.fn();

    render(
      <Composer
        onSendMessage={onSendMessage}
        isStreaming={true}
        onStopStreaming={onStopStreaming}
      />
    );

    const stopButton = screen.getByRole("button", { name: /stop generating/i });
    expect(stopButton).toBeInTheDocument();

    fireEvent.click(stopButton);
    expect(onStopStreaming).toHaveBeenCalled();
  });

  it("renders CodeBlock with language header and copy button", () => {
    render(<CodeBlock language="java" value='System.out.println("Hello");' />);

    expect(screen.getByText("java")).toBeInTheDocument();
    expect(screen.getByText('System.out.println("Hello");')).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /copy/i })).toBeInTheDocument();
  });

  it("renders UserMessage with inline edit mode", () => {
    const mockMessage: ChatMessageResponse = {
      id: "msg-1",
      conversationId: "conv-1",
      role: "USER",
      content: "Explain microservices",
      messageType: "TEXT",
      createdAt: new Date().toISOString(),
    };

    const onResend = vi.fn();

    render(<UserMessage message={mockMessage} onResend={onResend} />);

    expect(screen.getByText("Explain microservices")).toBeInTheDocument();

    const editButton = screen.getByRole("button", { name: /edit message/i });
    fireEvent.click(editButton);

    // Editing mode should show Cancel and Save & Resend
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    const saveButton = screen.getByRole("button", { name: /save & resend/i });
    expect(saveButton).toBeInTheDocument();

    fireEvent.click(saveButton);
    expect(onResend).toHaveBeenCalledWith("Explain microservices");
  });
});
