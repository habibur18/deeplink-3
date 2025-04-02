import { getCurrentUser, getUserDomains } from "@/lib/auth-actions"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LinkForm } from "@/components/link-form"

export default async function CreateLinkPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const domains = await getUserDomains()

  return (
    <div className="container py-10">
      <DashboardHeader user={user} />

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Create New Link</CardTitle>
            <CardDescription>
              Generate a special link that will open in the default browser when clicked from Instagram
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LinkForm domains={domains} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

