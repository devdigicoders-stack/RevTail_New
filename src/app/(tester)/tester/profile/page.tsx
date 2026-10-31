import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/current-user";

import TesterProfileForm from "./TesterProfileForm";

export default async function TesterProfilePage() {
  // ============================================================
  // 1. GET CURRENT USER
  // ============================================================

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (currentUser.role !== "TESTER") {
    redirect("/");
  }

  // ============================================================
  // 2. RENDER PROFILE FORM
  // ============================================================

  return <TesterProfileForm userId={currentUser.userId} />;
}