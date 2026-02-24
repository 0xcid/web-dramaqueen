import type { CfProperties, Request, ExecutionContext, KVNamespace } from '@cloudflare/workers-types'

declare module 'h3' {
  interface H3EventContext {
    cf: CfProperties
    cloudflare: {
      request: Request
      env: {
        DRAMA_KV: KVNamespace
        TELEGRAM_BOT_TOKEN: string
        TELEGRAM_CHANNEL_ID: string
      }
      context: ExecutionContext
    }
  }
}

export {}
