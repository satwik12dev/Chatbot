import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TooltipProvider } from "@/components/ui/Tooltip";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/chat",
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock conversation store
const mockCreateConversation = vi.fn().mockResolvedValue({ id: "new-conv" });
const mockFetchConversations = vi.fn();

vi.mock("@/store/conversationStore", () => ({
  useConversationStore: () => ({
    conversations: [
      {
        id: "c-1",
        userId: "u-1",
        title: "Spring Boot Microservices",
        archived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    isLoading: false,
    isCreating: false,
    fetchConversations: mockFetchConversations,
    createConversation: mockCreateConversation,
    updateConversation: vi.fn(),
    deleteConversation: vi.fn(),
  }),
}));

vi.mock("@/store/authStore", () => ({
  useAuthStore: () => ({
    user: { id: "u-1", name: "Satwik", email: "satwik@example.com" },
    logout: vi.fn(),
  }),
}));

describe("Sidebar Component", () => {
  it("renders AVA branding and conversation title", () => {
    render(
      <TooltipProvider>
        <Sidebar />
      </TooltipProvider>
    );
    expect(screen.getByText("AVA")).toBeInTheDocument();
    expect(screen.getByText("New Chat")).toBeInTheDocument();
    expect(screen.getByText("Spring Boot Microservices")).toBeInTheDocument();
    expect(screen.getByText("Satwik")).toBeInTheDocument();
  });

  it("triggers new conversation creation when New Chat is clicked", () => {
    render(
      <TooltipProvider>
        <Sidebar />
      </TooltipProvider>
    );
    const newChatBtn = screen.getByRole("button", { name: /new chat/i });
    fireEvent.click(newChatBtn);
    expect(mockCreateConversation).toHaveBeenCalled();
  });
});
