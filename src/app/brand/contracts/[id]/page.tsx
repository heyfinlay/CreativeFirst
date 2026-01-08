import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function ContractDetailPage({ params }: { params: { id: string } }) {
  redirect(`/app/brand/contracts/${params.id}`);
}
