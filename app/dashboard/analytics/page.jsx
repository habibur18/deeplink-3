import { getCurrentUser } from "@/lib/auth-actions"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { getAnalytics } from "@/lib/actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, LineChart, PieChart } from "@/components/charts"
import { DateRangePicker } from "@/components/date-range-picker"

export default async function AnalyticsPage({ searchParams }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // Get date range from query params or use default (last 30 days)
  const from = searchParams.from ? new Date(searchParams.from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const to = searchParams.to ? new Date(searchParams.to) : new Date()

  const analytics = await getAnalytics(from, to)

  return (
    <div className="container py-10">
      <DashboardHeader user={user} />

      <div className="flex justify-between items-center mt-8 mb-4">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <DateRangePicker />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
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
            <div className="text-2xl font-bold">{analytics.domains.length}</div>
            <p className="text-xs text-muted-foreground">Across {analytics.domains.length} business domains</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {analytics.conversionChange > 0 ? "+" : ""}
              {analytics.conversionChange}% from previous period
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="domains">Domains</TabsTrigger>
          <TabsTrigger value="links">Links</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Clicks Over Time</CardTitle>
              <CardDescription>Daily click activity for your links</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <LineChart data={analytics.clicksOverTime} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="domains" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Clicks by Domain</CardTitle>
              <CardDescription>Distribution of clicks across your domains</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <PieChart data={analytics.clicksByDomain} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="links" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Links</CardTitle>
              <CardDescription>Your most clicked links</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <BarChart data={analytics.topLinks} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Clicks by Device</CardTitle>
              <CardDescription>Distribution of clicks by device type</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <PieChart data={analytics.clicksByDevice} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

