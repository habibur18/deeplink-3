"use server"

import { connectToDatabase } from "@/lib/db"
import User from "@/lib/models/user"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

// Register a new user
export async function registerUser(formData) {
  try {
    await connectToDatabase()

    const name = formData.get("name")
    const email = formData.get("email")
    const password = formData.get("password")
    const domain = formData.get("domain")

    // Validate inputs
    if (!name || !email || !password || !domain) {
      return { error: "All fields are required" }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { error: "Please enter a valid email address" }
    }

    // Validate domain format (letters, numbers, hyphens only)
    const domainRegex = /^[a-zA-Z0-9-]+$/
    if (!domainRegex.test(domain)) {
      return { error: "Domain can only contain letters, numbers, and hyphens" }
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return { error: "Email already in use" }
    }

    // Check if domain already exists
    const domainExists = await User.findOne({ domains: domain })
    if (domainExists) {
      return { error: "Domain already in use" }
    }

    // Create new user
    const newUser = new User({
      name,
      email,
      password,
      domains: [domain],
      plan: "free",
      createdAt: new Date(),
    })

    await newUser.save()

    // Create and set JWT token
    const token = jwt.sign({ id: newUser._id, email: newUser.email }, process.env.NEXTAUTH_SECRET, { expiresIn: "7d" })

    cookies().set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    return { success: true }
  } catch (error) {
    console.error("Error registering user:", error)
    return { error: "Failed to register. Please try again." }
  }
}

// Login user
export async function loginUser(formData) {
  try {
    await connectToDatabase()

    const email = formData.get("email")
    const password = formData.get("password")

    // Validate inputs
    if (!email || !password) {
      return { error: "Email and password are required" }
    }

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return { error: "Invalid email or password" }
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return { error: "Invalid email or password" }
    }

    // Create and set JWT token
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.NEXTAUTH_SECRET, { expiresIn: "7d" })

    cookies().set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    return { success: true }
  } catch (error) {
    console.error("Error logging in:", error)
    return { error: "Failed to login. Please try again." }
  }
}

// Logout user
export async function logoutUser() {
  cookies().delete("auth-token")
  redirect("/login")
}

// Get current user
export async function getCurrentUser() {
  try {
    const token = cookies().get("auth-token")?.value

    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET)

    await connectToDatabase()

    const user = await User.findById(decoded.id).select("-password")

    if (!user) {
      return null
    }

    return JSON.parse(JSON.stringify(user))
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

// Add domain to user
export async function addDomain(formData) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { error: "Not authenticated" }
    }

    const domain = formData.get("domain")

    if (!domain) {
      return { error: "Domain is required" }
    }

    // Validate domain format (letters, numbers, hyphens only)
    const domainRegex = /^[a-zA-Z0-9-]+$/
    if (!domainRegex.test(domain)) {
      return { error: "Domain can only contain letters, numbers, and hyphens" }
    }

    await connectToDatabase()

    // Check if domain already exists
    const domainExists = await User.findOne({ domains: domain })
    if (domainExists) {
      return { error: "Domain already in use" }
    }

    // Add domain to user
    await User.findByIdAndUpdate(user._id, { $push: { domains: domain } })

    return { success: true }
  } catch (error) {
    console.error("Error adding domain:", error)
    return { error: "Failed to add domain. Please try again." }
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

// Change password
export async function changePassword(formData) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { error: "Not authenticated" }
    }

    const currentPassword = formData.get("currentPassword")
    const newPassword = formData.get("newPassword")

    if (!currentPassword || !newPassword) {
      return { error: "All fields are required" }
    }

    await connectToDatabase()

    // Get user with password
    const userWithPassword = await User.findById(user._id)

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, userWithPassword.password)
    if (!isMatch) {
      return { error: "Current password is incorrect" }
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    // Update password
    await User.findByIdAndUpdate(user._id, { password: hashedPassword })

    return { success: true }
  } catch (error) {
    console.error("Error changing password:", error)
    return { error: "Failed to change password. Please try again." }
  }
}

// Update user plan
export async function updateUserPlan(userId, plan) {
  try {
    await connectToDatabase()

    await User.findByIdAndUpdate(userId, { plan })

    return { success: true }
  } catch (error) {
    console.error("Error updating user plan:", error)
    return { error: "Failed to update plan" }
  }
}

// Edit domain
export async function editDomain(formData) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { error: "Not authenticated" }
    }

    const oldDomain = formData.get("oldDomain")
    const newDomain = formData.get("newDomain")

    if (!oldDomain || !newDomain) {
      return { error: "All fields are required" }
    }

    // Validate domain format
    const domainRegex = /^[a-zA-Z0-9-]+$/
    if (!domainRegex.test(newDomain)) {
      return { error: "Domain can only contain letters, numbers, and hyphens" }
    }

    await connectToDatabase()

    // Check if user owns the old domain
    if (!user.domains.includes(oldDomain)) {
      return { error: "You don't own this domain" }
    }

    // Check if new domain already exists
    const domainExists = await User.findOne({ domains: newDomain })
    if (domainExists) {
      return { error: "Domain already in use" }
    }

    // Update domain in user's domains array
    await User.findByIdAndUpdate(user._id, { $pull: { domains: oldDomain } })

    await User.findByIdAndUpdate(user._id, { $push: { domains: newDomain } })

    // Update domain in links
    await connectToDatabase()
    const Link = mongoose.models.Link

    await Link.updateMany({ userId: user._id, domain: oldDomain }, { domain: newDomain })

    return { success: true }
  } catch (error) {
    console.error("Error editing domain:", error)
    return { error: "Failed to edit domain. Please try again." }
  }
}

