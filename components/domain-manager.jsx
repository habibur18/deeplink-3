"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addDomain, editDomain } from "@/lib/auth-actions"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Pencil, Trash } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function DomainManager({ domains = [] }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [editingDomain, setEditingDomain] = useState(null)
  const [newDomainName, setNewDomainName] = useState("")

  async function handleAddDomain(event) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.target)
    const result = await addDomain(formData)

    setIsLoading(false)

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Success",
      description: "Domain added successfully",
    })

    event.target.reset()
    router.refresh()
  }

  async function handleEditDomain(event) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData()
    formData.append("oldDomain", editingDomain)
    formData.append("newDomain", newDomainName)

    const result = await editDomain(formData)

    setIsLoading(false)

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Success",
      description: "Domain updated successfully",
    })

    setEditingDomain(null)
    setNewDomainName("")
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Your Domains</h3>
        {domains.length > 0 ? (
          <div className="space-y-2">
            {domains.map((domain) => (
              <div key={domain} className="flex items-center justify-between p-3 bg-muted rounded-md">
                <span>{domain}</span>
                <div className="flex items-center space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingDomain(domain)
                          setNewDomainName(domain)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Domain</DialogTitle>
                        <DialogDescription>
                          Update your domain name. This will also update all links using this domain.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleEditDomain}>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="newDomain">Domain Name</Label>
                            <Input
                              id="newDomain"
                              value={newDomainName}
                              onChange={(e) => setNewDomainName(e.target.value)}
                              placeholder="mybusiness"
                              required
                            />
                            <p className="text-xs text-muted-foreground">
                              Only use letters, numbers, and hyphens. No spaces.
                            </p>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              "Update Domain"
                            )}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the domain and all associated links. This action cannot be
                          undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-destructive-foreground">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No domains added yet.</p>
        )}
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Add New Domain</h3>
        <form onSubmit={handleAddDomain} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="domain">Domain Name</Label>
            <Input id="domain" name="domain" placeholder="mynewbusiness" disabled={isLoading} required />
            <p className="text-xs text-muted-foreground">Only use letters, numbers, and hyphens. No spaces.</p>
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Domain"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}

