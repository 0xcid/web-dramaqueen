import { defineEventHandler, getQuery, getHeader, setHeaders, sendStream, sendError, createError } from 'h3'

// Whitelist of allowed video hosting domains
const ALLOWED_DOMAINS = [
    "whatbox.ca",
    "panda.whatbox.ca",
    "greip.whatbox.ca",
    "santol.whatbox.ca",
    "honeydew.whatbox.ca",
    "durian.whatbox.ca",
    "whatbox.ca",
    "storage.googleapis.com",
    "cloudflare.com",
    "r2.cloudflarestorage.com",
    "b-cdn.net",
    "bunny.net",
    "dramaqueen.iseries.my.id",
]

function isPrivateIP(hostname: string): boolean {
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") return true
    const privateRanges = [
        /^10\./,
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
        /^192\.168\./,
        /^169\.254\./,
        /^0\./,
        /^100\.(6[4-9]|[7-9][0-9]|1[0-2][0-7])\./,
    ]
    return privateRanges.some(range => range.test(hostname))
}

function validateUrl(urlString: string): string | null {
    try {
        const url = new URL(urlString)
        if (url.protocol !== "http:" && url.protocol !== "https:") return "Invalid protocol"
        if (isPrivateIP(url.hostname)) return "Private IP not allowed"
        const isAllowed = ALLOWED_DOMAINS.some(domain =>
            url.hostname === domain || url.hostname.endsWith(`.${domain}`)
        )
        if (!isAllowed) return `Domain not whitelisted: ${url.hostname}`
        return null
    } catch {
        return "Invalid URL format"
    }
}

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const videoUrl = query.url as string

    if (!videoUrl) {
        throw createError({ statusCode: 400, message: "Missing url parameter" })
    }

    const validationError = validateUrl(videoUrl)
    if (validationError) {
        console.warn(`[VideoProxy] Blocked: ${validationError}`, { url: videoUrl })
        throw createError({ statusCode: 403, message: "URL not allowed" })
    }

    try {
        const url = new URL(videoUrl)
        const username = url.username
        const password = url.password

        url.username = ""
        url.password = ""
        const cleanUrl = url.toString()

        const headers: HeadersInit = {}
        const rangeHeader = getHeader(event, 'range')
        if (rangeHeader) headers["Range"] = rangeHeader

        if (username && password) {
            const credentials = btoa(`${username}:${password}`)
            headers["Authorization"] = `Basic ${credentials}`
        }

        const response = await fetch(cleanUrl, { headers })

        if (!response.ok && response.status !== 206) {
            throw createError({ statusCode: response.status, message: `Upstream error: ${response.status}` })
        }

        // Set proper status for range requests
        if (response.status === 206) {
            setHeader(event, 'status', 206)
        }

        // Set response headers
        const copyHeaders = ['content-type', 'content-length', 'content-range', 'accept-ranges']
        copyHeaders.forEach(h => {
            const val = response.headers.get(h)
            if (val) setHeaders(event, { [h]: val })
        })

        // CORS headers
        setHeaders(event, {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Range",
            "Access-Control-Expose-Headers": "Content-Range, Content-Length, Accept-Ranges",
            "Cache-Control": "public, max-age=3600",
            "Accept-Ranges": "bytes"
        })

        const contentType = response.headers.get("content-type") || ""
        const isM3U8 = contentType.includes("mpegurl") || contentType.includes("x-mpegurl") || videoUrl.includes(".m3u8")

        if (isM3U8) {
            const text = await response.text()
            const baseUrl = new URL(cleanUrl)

            const rewriteUrl = (u: string) => {
                try {
                    const absoluteUrl = new URL(u, baseUrl).toString()
                    return `/api/video-proxy?url=${encodeURIComponent(absoluteUrl)}`
                } catch {
                    return u
                }
            }

            const newText = text.split('\n').map(line => {
                const trimmed = line.trim()
                if (!trimmed || trimmed.startsWith('#EXT-X-ENDLIST')) return line
                if (trimmed.startsWith('#')) {
                    return line.replace(/URI="([^"]+)"/g, (_, uri) => `URI="${rewriteUrl(uri)}"`)
                }
                return rewriteUrl(trimmed)
            }).join('\n')

            return newText
        }

        return sendStream(event, response.body!)
    } catch (error: any) {
        console.error("[VideoProxy] Error:", error)
        throw createError({ statusCode: 500, message: "Proxy error" })
    }
})
