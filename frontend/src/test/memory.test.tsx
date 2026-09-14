import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryView } from "@/components/memory/MemoryView";
import { memoryApi } from "@/api/memoryApi";

vi.mock("@/api/memoryApi", () => ({
  memoryApi: {
    getMemories: vi.fn(),
    deleteMemory: vi.fn(),
    deleteAllMemories: vi.fn(),
  },
}));

describe("MemoryView Component", () => {
  it("renders memories retrieved from backend", async () => {
    vi.mocked(memoryApi.getMemories).mockResolvedValueOnce({
      success: true,
      message: "Loaded",
      timestamp: new Date().toISOString(),
      data: [
        {
          id: "mem-1",
          memoryKey: "preferred_language",
          memoryValue: "User prefers Java 24 and Next.js TypeScript",
          memoryType: "PREFERENCE",
          importance: 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    });

    render(<MemoryView />);

    await waitFor(() => {
      expect(screen.getByText("preferred_language")).toBeInTheDocument();
      expect(
        screen.getByText("User prefers Java 24 and Next.js TypeScript")
      ).toBeInTheDocument();
    });
  });
});
