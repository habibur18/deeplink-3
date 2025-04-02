import { getCurrentUser } from "@/lib/auth-actions"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PasswordChangeForm } from "@/components/password-change-form"
import { SubscriptionPlan } from "@/components/subscription-plan"
import { DomainManager } from "@/components/domain-manager"

export default async function SettingsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="container py-10">
      <DashboardHeader user={user} />

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Account Settings</h2>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="domains">Domains</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>View and update your account details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium">Name</h3>
                      <p className="text-sm text-muted-foreground">{user.name}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Email</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Account Created</h3>
                      <p className="text-sm text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Current Plan</h3>
                      <p className="text-sm text-muted-foreground capitalize">{user.plan}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent>
                <PasswordChangeForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="domains" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Manage Domains</CardTitle>
                <CardDescription>Add, edit, or remove your business domains</CardDescription>
              </CardHeader>
              <CardContent>
                <DomainManager domains={user.domains} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Plan</CardTitle>
                <CardDescription>Manage your subscription and billing</CardDescription>
              </CardHeader>
              <CardContent>
                <SubscriptionPlan currentPlan={user.plan} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

