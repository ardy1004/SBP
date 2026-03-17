import { PageInsightsDashboard } from "@/components/admin/PageInsightsDashboard";
import { AdminSidebar } from "@/components/admin/layouts";

export default function AdminPageInsightsPage() {
  return (
    <div className="flex h-screen">
      <AdminSidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-6 md:p-8">
          <PageInsightsDashboard />
        </div>
      </div>
    </div>
  );
}