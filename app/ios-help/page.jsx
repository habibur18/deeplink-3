import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function IOSHelpPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">How to Open Links in External Browser on iOS</h1>

        <div className="space-y-6">
          <div className="bg-muted p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Why Instagram Uses an In-App Browser</h2>
            <p>
              Instagram and many other social media apps use in-app browsers to keep users within their app. This can
              limit functionality and prevent features like autofill, extensions, and proper navigation.
            </p>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Our Solution</h2>
            <p>Our links use special techniques to bypass Instagram&apos;s in-app browser on iOS devices:</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Our Solution</h2>
            <p>Our links use special techniques to bypass Instagram&apos;s in-app browser on iOS devices:</p>

            <ol className="list-decimal pl-5 space-y-2">
              <li>
                <strong>Special Meta Tags:</strong> We use specific meta tags that signal to iOS to open links in Safari
                instead of the in-app browser.
              </li>
              <li>
                <strong>JavaScript Redirects:</strong> We implement multiple JavaScript redirects that help break out of
                the in-app browser environment.
              </li>
              <li>
                <strong>Timing Techniques:</strong> Our system uses carefully timed redirects that can bypass
                Instagram&apos;s in-app browser restrictions.
              </li>
            </ol>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Troubleshooting</h2>
            <p className="mb-4">If links are still opening in Instagram&apos;s browser, try these steps:</p>

            <ol className="list-decimal pl-5 space-y-2">
              <li>
                <strong>Tap and hold the link</strong> in Instagram and select &quot;Open in Safari&quot;
              </li>
              <li>
                <strong>Update your Instagram app</strong> to the latest version
              </li>
              <li>
                <strong>Update iOS</strong> to the latest version
              </li>
              <li>
                <strong>Clear Safari cache</strong> in your iOS settings
              </li>
            </ol>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Manual Method</h2>
            <p>
              If automatic redirection doesn&apos;t work, you can always tap and hold on the link in Instagram and
              select &quot;Open in Safari&quot; from the context menu.
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <Link href="/">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

