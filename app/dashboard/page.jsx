import { getCurrentUser } from "@/lib/auth-actions"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { getLinks, getAnalytics } from "@/lib/actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LinkList } from "@/components/link-list"
import { BarChart } from "@/components/charts"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart2 } from "lucide-react"

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const links = await getLinks()

  // Get analytics for the last 7 days
  const to = new Date()
  const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const analytics = await getAnalytics(from, to)

  return (
    <div className="container py-10">
      <DashboardHeader user={user} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalClicks}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.clicksChange > 0 ? "+" : ""}
              {analytics.clicksChange}% from previous period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeLinks}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.linksChange > 0 ? "+" : ""}
              {analytics.linksChange}% from previous period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Domains</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.domains.length}</div>
            <p className="text-xs text-muted-foreground">Across {user.domains.length} business domains</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{user.plan}</div>
            <p className="text-xs text-muted-foreground">
              {user.plan === "free" ? "Upgrade for more features" : "All features unlocked"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Top Links</CardTitle>
              <CardDescription>Your most clicked links in the last 7 days</CardDescription>
            </div>
            <Link href="/dashboard/analytics">
              <Button variant="ghost" size="sm">
                <BarChart2 className="mr-2 h-4 w-4" />
                View All Analytics
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="h-[300px]">
            {analytics.topLinks.length > 0 ? (
              <BarChart data={analytics.topLinks} />
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">No data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Link href="/dashboard/create">
              <Button variant="outline" className="w-full justify-between">
                Create New Link
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard/analytics">
              <Button variant="outline" className="w-full justify-between">
                View Analytics
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button variant="outline" className="w-full justify-between">
                Manage Account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard/settings?tab=subscription">
              <Button variant="outline" className="w-full justify-between">
                Upgrade Plan
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Your Links</CardTitle>
            <CardDescription>Manage and track your created links</CardDescription>
          </CardHeader>
          <CardContent>
            <LinkList links={links} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

