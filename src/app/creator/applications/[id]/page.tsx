import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function ApplicationDetailRedirect({ params }: { params: { id: string } }) {
  redirect(`/app/creator/applications/${params.id}`);
}
