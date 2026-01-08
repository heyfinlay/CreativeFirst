import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function CreatorDashboard() {
  redirect("/app/creator");
}
