"use server"

import { connectToDatabase } from "@/lib/db"
import Link from "@/lib/models/link"
import { nanoid } from "nanoid"
import { getCurrentUser } from "@/lib/auth-actions"
import { headers } from "next/headers"

// Create a new link
export async function createLink(originalUrl, customSlug, domain = "") {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { error: "You must be logged in to create links" }
    }

    await connectToDatabase()

    // Generate a slug if not provided
    const slug = customSlug || nanoid(6)

    // Check if slug already exists
    if (customSlug) {
      const existingLink = await Link.findOne({ slug: customSlug, domain })
      if (existingLink) {
        return { error: "This custom link is already taken. Please try another." }
      }
    }

    // Validate domain
    if (domain && !user.domains.includes(domain)) {
      return { error: "You don't have access to this domain" }
    }

    // Check link limits based on plan
    const userLinks = await Link.countDocuments({ userId: user._id })

    if (user.plan === "free" && userLinks >= 10) {
      return {
        error: "You've reached the maximum number of links for the free plan. Please upgrade to create more links.",
      }
    }

    if (user.plan === "basic" && userLinks >= 50) {
      return {
        error: "You've reached the maximum number of links for the basic plan. Please upgrade to create more links.",
      }
    }

    // Create the link
    const newLink = new Link({
      originalUrl,
      slug,
      customSlug: !!customSlug,
      clicks: 0,
      userId: user._id,
      domain,
      clicksData: [],
    })

    await newLink.save()
    return { success: true, slug }
  } catch (error) {
    console.error("Error creating link:", error)
    return { error: "Failed to create link. Please try again." }
  }
}

// Get all links for current user
export async function getLinks() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return []
    }

    await connectToDatabase()
    const links = await Link.find({ userId: user._id }).sort({ createdAt: -1 })
    return JSON.parse(JSON.stringify(links))
  } catch (error) {
    console.error("Error fetching links:", error)
    return []
  }
}

// Get redirect URL and increment click count
export async function getRedirectUrl(slug, domain = "") {
  try {
    await connectToDatabase()

    const query = { slug }
    if (domain) {
      query.domain = domain
    }

    // Get user agent info
    const userAgent = headers().get("user-agent") || ""
    const isMobile = /mobile|android|iphone|ipad|ipod/i.test(userAgent)
    const isTablet = /tablet|ipad/i.test(userAgent)
    const deviceType = isTablet ? "tablet" : isMobile ? "mobile" : "desktop"

    // Get referrer info
    const referrer = headers().get("referer") || ""

    // Get IP info (simplified)
    const ip = headers().get("x-forwarded-for") || "unknown"

    // Create click data
    const clickData = {
      timestamp: new Date(),
      deviceType,
      referrer,
      ip,
      userAgent,
    }

    const link = await Link.findOneAndUpdate(
      query,
      {
        $inc: { clicks: 1 },
        $push: { clicksData: clickData },
      },
      { new: true },
    )

    if (!link) {
      return { url: null }
    }

    return { url: link.originalUrl }
  } catch (error) {
    console.error("Error getting redirect URL:", error)
    return { url: null }
  }
}

// Delete a link
export async function deleteLink(id) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      throw new Error("Not authenticated")
    }

    await connectToDatabase()

    // Ensure the link belongs to the user
    const link = await Link.findOne({ _id: id, userId: user._id })

    if (!link) {
      throw new Error("Link not found or you don't have permission")
    }

    await Link.findByIdAndDelete(id)
    return { success: true }
  } catch (error) {
    console.error("Error deleting link:", error)
    throw new Error("Failed to delete link")
  }
}

// Get user domains
export async function getUserDomains() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return []
    }

    return user.domains || []
  } catch (error) {
    console.error("Error getting user domains:", error)
    return []
  }
}

// Get analytics data
export async function getAnalytics(from, to) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return {
        totalClicks: 0,
        clicksChange: 0,
        activeLinks: 0,
        linksChange: 0,
        domains: [],
        conversionRate: 0,
        conversionChange: 0,
        clicksOverTime: [],
        clicksByDomain: [],
        topLinks: [],
        clicksByDevice: [],
      }
    }

    await connectToDatabase()

    // Get all links for the user
    const links = await Link.find({ userId: user._id })

    // Calculate total clicks in the date range
    let totalClicks = 0
    let clicksInPreviousPeriod = 0
    const timeRange = to - from
    const previousFrom = new Date(from.getTime() - timeRange)
    const previousTo = new Date(to.getTime() - timeRange)

    // Prepare data structures for charts
    const clicksOverTime = []
    const clicksByDomain = []
    const topLinks = []
    const clicksByDevice = [
      { label: "Desktop", value: 0 },
      { label: "Mobile", value: 0 },
      { label: "Tablet", value: 0 },
    ]

    // Process each link
    links.forEach((link) => {
      // Count clicks in the current period
      const clicksInPeriod = link.clicksData.filter(
        (click) => new Date(click.timestamp) >= from && new Date(click.timestamp) <= to,
      )

      totalClicks += clicksInPeriod.length

      // Count clicks in the previous period
      const clicksInPrevious = link.clicksData.filter(
        (click) => new Date(click.timestamp) >= previousFrom && new Date(click.timestamp) <= previousTo,
      )

      clicksInPreviousPeriod += clicksInPrevious.length

      // Add to top links if it has clicks
      if (clicksInPeriod.length > 0) {
        topLinks.push({
          label: link.slug,
          value: clicksInPeriod.length,
        })
      }

      // Count by device type
      clicksInPeriod.forEach((click) => {
        if (click.deviceType === "desktop") {
          clicksByDevice[0].value++
        } else if (click.deviceType === "mobile") {
          clicksByDevice[1].value++
        } else if (click.deviceType === "tablet") {
          clicksByDevice[2].value++
        }
      })

      // Add to domain stats
      const domainName = link.domain || "direct"
      const existingDomain = clicksByDomain.find((d) => d.label === domainName)

      if (existingDomain) {
        existingDomain.value += clicksInPeriod.length
      } else {
        clicksByDomain.push({
          label: domainName,
          value: clicksInPeriod.length,
        })
      }
    })

    // Calculate clicks over time (daily)
    const days = Math.ceil((to - from) / (1000 * 60 * 60 * 24))

    for (let i = 0; i < days; i++) {
      const day = new Date(from)
      day.setDate(day.getDate() + i)

      const nextDay = new Date(day)
      nextDay.setDate(nextDay.getDate() + 1)

      const clicksOnDay = links.reduce((total, link) => {
        return (
          total +
          link.clicksData.filter((click) => {
            const clickDate = new Date(click.timestamp)
            return clickDate >= day && clickDate < nextDay
          }).length
        )
      }, 0)

      clicksOverTime.push({
        label: day.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        value: clicksOnDay,
      })
    }

    // Sort top links by clicks
    topLinks.sort((a, b) => b.value - a.value)

    // Calculate changes
    const clicksChange =
      clicksInPreviousPeriod === 0
        ? 100
        : Math.round(((totalClicks - clicksInPreviousPeriod) / clicksInPreviousPeriod) * 100)

    // Count active links (links with at least one click in the period)
    const activeLinks = links.filter((link) =>
      link.clicksData.some((click) => new Date(click.timestamp) >= from && new Date(click.timestamp) <= to),
    ).length

    // Calculate active links in previous period
    const activeLinksInPrevious = links.filter((link) =>
      link.clicksData.some(
        (click) => new Date(click.timestamp) >= previousFrom && new Date(click.timestamp) <= previousTo,
      ),
    ).length

    const linksChange =
      activeLinksInPrevious === 0
        ? 100
        : Math.round(((activeLinks - activeLinksInPrevious) / activeLinksInPrevious) * 100)

    // Calculate conversion rate (active links / total links)
    const conversionRate = links.length === 0 ? 0 : Math.round((activeLinks / links.length) * 100)

    const previousConversionRate = links.length === 0 ? 0 : Math.round((activeLinksInPrevious / links.length) * 100)

    const conversionChange =
      previousConversionRate === 0
        ? 100
        : Math.round(((conversionRate - previousConversionRate) / previousConversionRate) * 100)

    return {
      totalClicks,
      clicksChange,
      activeLinks,
      linksChange,
      domains: user.domains,
      conversionRate,
      conversionChange,
      clicksOverTime,
      clicksByDomain,
      topLinks: topLinks.slice(0, 10), // Top 10 links
      clicksByDevice,
    }
  } catch (error) {
    console.error("Error getting analytics:", error)
    return {
      totalClicks: 0,
      clicksChange: 0,
      activeLinks: 0,
      linksChange: 0,
      domains: [],
      conversionRate: 0,
      conversionChange: 0,
      clicksOverTime: [],
      clicksByDomain: [],
      topLinks: [],
      clicksByDevice: [],
    }
  }
}

