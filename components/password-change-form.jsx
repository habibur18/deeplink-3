"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { changePassword } from "@/lib/auth-actions"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function PasswordChangeForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  async function onSubmit(event) {
    event.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess(false)

    const formData = new FormData(event.target)
    const result = await changePassword(formData)

    setIsLoading(false)

    if (result.error) {
      setError(result.error)
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
      return
    }

    setSuccess(true)
    toast({
      title: "Success",
      description: "Your password has been updated",
    })

    // Reset form
    event.target.reset()
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">Your password has been successfully updated.</AlertDescription>
        </Alert>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Current Password</Label>
          <Input id="currentPassword" name="currentPassword" type="password" required disabled={isLoading} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <Input id="newPassword" name="newPassword" type="password" required disabled={isLoading} />
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Update Password"
          )}
        </Button>
      </form>
    </div>
  )
}

