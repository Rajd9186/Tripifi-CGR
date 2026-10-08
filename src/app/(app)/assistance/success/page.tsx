import type { Metadata } from "next";
import EnquirySuccess from "@/components/booking/EnquirySuccess";

export const metadata: Metadata = { title: "Request Received" };

export default async function AssistanceSuccessPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams;
  return (
    <div className="px-4 py-10 sm:px-6 lg:px-8">
      <EnquirySuccess reference={ref ?? "TFC-2026-000000"} />
    </div>
  );
}
