import { Metadata } from "next";
import { getBusinessById, BusinessWithReviewCount } from "@/services/businesses";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const businessWithReviewCount: BusinessWithReviewCount = await getBusinessById(resolvedParams.id);
    const businessName = businessWithReviewCount.business.name;
   
    return {
      title: businessName,
      description: businessWithReviewCount.business.description || "",
    };
  } catch (error) {
    console.error("Error fetching business for metadata:", error);
    return {
      title: "Business Details",
      description: "",
    };
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}