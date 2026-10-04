import type { Metadata } from "next";
import EnquirySuccess from "@/components/booking/EnquirySuccess";

export const metadata: Metadata = { title: "Request Received" };

export default function AssistanceSuccessPage({ searchParams }: { searchParams: { ref?: string } }) {
  return (
    <div className="px-4 py-10 sm:px-6 lg:px-8">
      <EnquirySuccess reference={searchParams.ref ?? "TFC-2026-000000"} />
    </div>
  );
}
