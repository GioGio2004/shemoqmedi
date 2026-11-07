'use client'

import { ReactNode } from 'react'
import { ConvexReactClient } from 'convex/react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { useAuth } from '@clerk/nextjs'

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error('Missing NEXT_PUBLIC_CONVEX_URL in your .env file')
}

const dev = process.env.NODE_ENV === 'development'

// By default the Convex client console.error()s every failed call with its
// request id and server stack, readable by any visitor in the browser
// console. Forms catch failures and show a clean message (lib/errors.ts), so
// errors are never logged here; server logs reach the console in dev only.
const logger = {
  logVerbose() {},
  log: (...args: unknown[]) => { if (dev) console.log(...args) },
  warn: (...args: unknown[]) => { if (dev) console.warn(...args) },
  error() {},
}

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL, { logger })

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  )
}
