import { V2DashboardLayout } from "@/components/dashboard/v2-dashboard-layout"
import { AccountPageContent } from "@/components/account/account-page-content"

export default function AccountPreferencesPage() {
  return (
    <V2DashboardLayout>
      <AccountPageContent page="preferences" />
    </V2DashboardLayout>
  )
}
