import { requireUser } from "@/lib/auth";
import { userDestination } from "@/lib/session";
import { redirect } from "next/navigation";
export default async function DashboardPage() {
  redirect(userDestination(await requireUser()));
}

