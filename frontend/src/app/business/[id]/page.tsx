import { getBusinessById } from "@/services/businesses";
import { notFound } from "next/navigation";
import ClientBusinessPage from "./client-business-page";

interface BusinessPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BusinessPage({ params }: BusinessPageProps) {
  try {
    const resolvedParams = await params;
    const businessWithReviewCount = await getBusinessById(resolvedParams.id);
    return <ClientBusinessPage businessObject={businessWithReviewCount} />;
  } catch (error) {
    console.error("Error fetching business:", error);
    notFound();
  }
}