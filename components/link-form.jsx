"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createLink, getUserDomains } from "@/lib/actions"
import { Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function LinkForm() {
  const router = useRouter()
  const [destinationUrl, setDestinationUrl] = useState("")
  const [customSlug, setCustomSlug] = useState("")
  const [useCustomSlug, setUseCustomSlug] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [domains, setDomains] = useState([])
  const [selectedDomain, setSelectedDomain] = useState("")
  const [linkType, setLinkType] = useState("domain") // "domain" or "direct"

  useEffect(() => {
    async function fetchDomains() {
      const domainsData = await getUserDomains()
      setDomains(domainsData)
      if (domainsData.length > 0) {
        setSelectedDomain(domainsData[0])
      }
    }

    fetchDomains()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()

    if (!destinationUrl) {
      toast({
        title: "Error",
        description: "Please enter a destination URL",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      // Validate URL format
      try {
        new URL(destinationUrl)
      } catch (e) {
        toast({
          title: "Invalid URL",
          description: "Please enter a valid URL including http:// or https://",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      const slug = useCustomSlug ? customSlug : undefined
      const domain = linkType === "domain" ? selectedDomain : ""

      const result = await createLink(destinationUrl, slug, domain)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success!",
          description: "Your link has been created",
        })
        setDestinationUrl("")
        setCustomSlug("")
        router.refresh()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create link. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="url">Destination URL</Label>
        <Input
          id="url"
          placeholder="https://example.com"
          value={destinationUrl}
          onChange={(e) => setDestinationUrl(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Link Type</Label>
        <RadioGroup value={linkType} onValueChange={setLinkType} className="flex flex-col space-y-1">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="domain" id="domain" />
            <Label htmlFor="domain" className="cursor-pointer">
              Use domain (yourdomain.com/businessname/link)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="direct" id="direct" />
            <Label htmlFor="direct" className="cursor-pointer">
              Use direct link (yourdomain.com/r/link)
            </Label>
          </div>
        </RadioGroup>
      </div>

      {linkType === "domain" && (
        <div className="space-y-2">
          <Label htmlFor="domain">Select Domain</Label>
          <Select value={selectedDomain} onValueChange={setSelectedDomain}>
            <SelectTrigger>
              <SelectValue placeholder="Select a domain" />
            </SelectTrigger>
            <SelectContent>
              {domains.map((domain) => (
                <SelectItem key={domain} value={domain}>
                  {domain}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Switch id="custom-slug" checked={useCustomSlug} onCheckedChange={setUseCustomSlug} />
        <Label htmlFor="custom-slug">Use custom link</Label>
      </div>

      {useCustomSlug && (
        <div className="space-y-2">
          <Label htmlFor="custom-slug-input">Custom Link</Label>
          <Input
            id="custom-slug-input"
            placeholder="my-custom-link"
            value={customSlug}
            onChange={(e) => setCustomSlug(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">Only use letters, numbers, and hyphens. No spaces.</p>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating...
          </>
        ) : (
          "Create Link"
        )}
      </Button>
    </form>
  )
}

