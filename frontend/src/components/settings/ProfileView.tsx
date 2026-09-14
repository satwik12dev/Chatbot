"use client";

import React, { useState } from "react";
import { User, Mail, Calendar, ShieldAlert, LogOut, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const ProfileView: React.FC = () => {
  const { user, logout, deleteAccount } = useAuthStore();
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      await deleteAccount();
      toast.success("Account and all personal data deleted permanently.");
      router.push("/login");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete account");
      setIsLoading(false);
    }
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Recently joined";

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-black">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Header */}
        <div className="border-b border-white/[0.08] pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#121218] text-zinc-200 border border-white/[0.1] shadow-xs">
              <User className="h-4.5 w-4.5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-white">User Profile</h1>
              <p className="text-xs text-zinc-400">
                View your account identity and manage privacy settings.
              </p>
            </div>
          </div>
        </div>

        {/* Profile Details Card */}
        <div className="rounded-3xl border border-white/[0.08] bg-[#09090d]/85 p-7 space-y-6 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <Avatar type="user" name={user?.name || "User"} size="lg" className="h-16 w-16 text-xl shadow-md" />
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">{user?.name || "User"}</h2>
              <p className="text-xs font-medium text-zinc-400 mt-0.5">{user?.email || "user@ava.ai"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/[0.08] pt-6">
            <div className="flex items-center gap-3 rounded-2xl bg-[#111118] p-3.5 border border-white/[0.06]">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] text-indigo-400">
                <Mail className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Email Address</p>
                <p className="text-xs font-semibold text-white mt-0.5">{user?.email || "user@ava.ai"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-[#111118] p-3.5 border border-white/[0.06]">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] text-purple-400">
                <Calendar className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Member Since</p>
                <p className="text-xs font-semibold text-white mt-0.5">{memberSince}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-3.5 w-3.5" />
              <span>Log out</span>
            </Button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-3xl border border-red-500/20 bg-red-950/20 p-7 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-red-400">
            <ShieldAlert className="h-5 w-5" />
            <h2 className="text-xs font-bold tracking-wider uppercase text-red-400">Danger Zone</h2>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Permanently delete your user account, conversation history, and synthesized long-term memory. This action conforms to GDPR right-to-be-forgotten and cannot be undone.
          </p>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsDeletingAccount(true)}
            className="gap-2 font-semibold"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete Account &amp; All Data</span>
          </Button>
        </div>
      </div>

      <ConfirmModal
        isOpen={isDeletingAccount}
        onClose={() => setIsDeletingAccount(false)}
        onConfirm={handleDeleteAccount}
        isLoading={isLoading}
        title="Delete Account & All Data?"
        description="This will permanently delete your account, conversations, and all long-term memories from the database. This action is irreversible."
        confirmLabel="Permanently Delete Account"
      />
    </div>
  );
};
