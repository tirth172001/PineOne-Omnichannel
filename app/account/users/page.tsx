import { V2DashboardLayout } from "@/components/dashboard/v2-dashboard-layout"
import { AccountPageContent } from "@/components/account/account-page-content"

export default function AccountUsersPage() {
  return (
    <V2DashboardLayout>
      <AccountPageContent page="users" />
    </V2DashboardLayout>
  )
}
