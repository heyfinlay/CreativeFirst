import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function CreatorSavedPage() {
  redirect("/app/creator/saved");
}
