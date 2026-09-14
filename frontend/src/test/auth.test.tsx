import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "@/app/login/page";
import RegisterPage from "@/app/register/page";
import { authApi } from "@/api/authApi";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useSearchParams: () => ({
    get: () => null,
  }),
}));

// Mock auth store
vi.mock("@/store/authStore", () => ({
  useAuthStore: () => ({
    login: vi.fn(),
    register: vi.fn(),
    isLoading: false,
  }),
}));

// Mock authApi
vi.mock("@/api/authApi", () => ({
  authApi: {
    sendOtp: vi.fn().mockResolvedValue({ success: true }),
    verifyOtp: vi.fn().mockResolvedValue({ success: true }),
  },
}));

describe("Authentication Pages", () => {
  it("renders Login Page with inputs and sign in button", () => {
    render(<LoginPage />);
    expect(screen.getByText("Welcome back.")).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("renders Register Page with name, email, password and transitions to OTP step", async () => {
    render(<RegisterPage />);
    expect(screen.getByText("Create your AVA account")).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password \(min 8 chars\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();

    const continueBtn = screen.getByRole("button", { name: /continue & send code/i });
    expect(continueBtn).toBeInTheDocument();

    // Fill form
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "Ada Lovelace" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "ada@example.com" } });
    fireEvent.change(screen.getByLabelText(/password \(min 8 chars\)/i), { target: { value: "Password123!" } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "Password123!" } });

    fireEvent.click(continueBtn);

    await waitFor(() => {
      expect(authApi.sendOtp).toHaveBeenCalledWith("ada@example.com");
      expect(screen.getByText("Verify your email")).toBeInTheDocument();
      expect(screen.getByLabelText(/6-digit verification code/i)).toBeInTheDocument();
    });
  });
});
