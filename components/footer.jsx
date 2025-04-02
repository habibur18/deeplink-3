import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          &copy; {new Date().getFullYear()} Instagram Browser Redirect. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <Link href="/android-help" className="text-sm text-muted-foreground underline underline-offset-4">
            Android Help
          </Link>
          <Link href="/ios-help" className="text-sm text-muted-foreground underline underline-offset-4">
            iOS Help
          </Link>
          <Link href="/about" className="text-sm text-muted-foreground underline underline-offset-4">
            About
          </Link>
        </div>
      </div>
    </footer>
  )
}

