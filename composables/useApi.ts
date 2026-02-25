import type { Drama, DramaDetail, Episode, HomeData, ApiResult } from '~/types'

const API_BASE = 'https://dramaqueen.iseries.my.id/api'

export const useApi = () => {
  const config = useRuntimeConfig()
  const baseUrl = config.public.apiBase || API_BASE

  const fetchApi = async <T>(endpoint: string, params?: Record<string, string | number>): Promise<T> => {
    const url = new URL(`${baseUrl}${endpoint}`)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value))
      })
    }

    try {
      const headers: HeadersInit = {
        'x-api-key': '7a56ed7a117d0b58f841f827314fa95d927kdjn0okdkndjaebdndwkamvnfjdltdk'
      }

      const response = await fetch(url.toString(), { headers })
      if (!response.ok) throw new Error(`API request failed: ${response.status}`)
      const result: any = await response.json()
      return (result.data || result) as T
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  const mapDramaData = (data: any): Drama => {
    if (!data) return data

    // Pick the first non-empty value from the candidate fields
    const pick = (...fields: string[]) =>
      fields.map(f => data[f]).find(v => v && String(v).trim() !== '') || ''

    return {
      ...data,
      id: String(data.drama_id || data.id || ''),
      title: data.name || data.title || 'Untitled',
      // Portrait poster: prefer portrait-style covers, fall back to landscape URL
      poster: pick('cover', 'poster', 'image', 'img', 'thumb', 'thumbnail', 'pic', 'photo', 'img_landscape_url', 'cover_url'),
      backdrop: pick('img_landscape_url', 'backdrop', 'cover_url', 'cover'),
      year: data.tahun_rilis ? String(data.tahun_rilis).slice(0, 4) : (data.tahun_int ? String(data.tahun_int) : (data.year || '')),
      status: data.is_finish ? 'Completed' : (data.is_coming ? 'Coming Soon' : (data.status || 'Ongoing')),
      rating: data.rating ? String(data.rating) : data.rating
    }
  }

  const mapDramaDetail = (data: any): DramaDetail => {
    if (!data) return data
    const drama = mapDramaData(data)
    return {
      ...drama,
      synopsis: data.desc || data.description || data.sinopsis || '',
      genres: data.genre || data.genres || [],
      cast: data.cast || [],
      episodes: data.episodes || []
    }
  }

  const mapEpisodeData = (data: any): Episode => {
    if (!data) return data

    const needsCorsProxy = (url: string): boolean => {
      try {
        const parsed = new URL(url)
        const corsProxyDomains = ['whatbox.ca'] // Add others if known
        return corsProxyDomains.some(d =>
          parsed.hostname === d || parsed.hostname.endsWith(`.${d}`)
        )
      } catch { return false }
    }

    const wrapWithProxy = (url: string): string => {
      if (url && (url.includes('@') || needsCorsProxy(url))) {
        return `/api/video-proxy?url=${encodeURIComponent(url)}`
      }
      return url
    }

    // Priority for video URL from rabastrim research
    let videoUrl = data.link720_en ||
      data.link720_id ||
      data.videoUrl ||
      data.videoUrlPremium ||
      data.link720_premium ||
      data.link720_pro ||
      data.link_720 ||
      data.link_720_premium ||
      '';

    videoUrl = wrapWithProxy(videoUrl)

    return {
      ...data,
      id: String(data.id || ''),
      episodeNumber: data.episodeNumber || data.number_episode || data.number || 0,
      videoUrl: videoUrl,
      link_720_premium: wrapWithProxy(data.link_720_premium || data.link720_premium || ''),
      link_480: wrapWithProxy(data.link_480 || ''),
      link_360: wrapWithProxy(data.link_360 || ''),
      title: data.title || `Episode ${data.episodeNumber || data.number_episode || ''}`
    }
  }

  const getHome = async () => {
    try {
      const data = await fetchApi<HomeData>('/drama/home')
      return {
        popular: (data.popular || []).map(mapDramaData),
        latest: (data.latest || []).map(mapDramaData)
      }
    } catch (e) {
      console.error('getHome error:', e)
      return { popular: [], latest: [] }
    }
  }

  const getDramaList = async (page = 1, limit = 20) => {
    const data = await fetchApi<Drama[]>('/drama/list', { page, limit })
    return (data || []).map(mapDramaData)
  }

  const getPopular = async () => {
    const data = await fetchApi<Drama[]>('/drama/popular')
    return (data || []).map(mapDramaData)
  }

  const getLatest = async (limit = 20) => {
    const data = await fetchApi<Drama[]>('/drama/latest', { limit })
    return (data || []).map(mapDramaData)
  }

  const searchDrama = async (query: string, page = 1) => {
    const data = await fetchApi<Drama[]>('/drama/search', { q: query, page })
    return (data || []).map(mapDramaData)
  }

  const getDramaDetail = async (id: string) => {
    const data = await fetchApi<any>(`/drama/detail/${id}`)
    return mapDramaDetail(data)
  }

  const getEpisodes = async (id: string) => {
    try {
      const data = await fetchApi<Episode[]>(`/drama/episodes/${id}`)
      return (data || []).map(mapEpisodeData)
    } catch (e) {
      console.error('getEpisodes error:', e)
      return []
    }
  }

  const getEpisode = async (id: string) => {
    try {
      const data = await fetchApi<any>(`/drama/episode/${id}`)
      return mapEpisodeData(data)
    } catch (e) {
      console.error('getEpisode error:', e)
      return null
    }
  }

  return {
    getHome,
    getDramaList,
    getPopular,
    getLatest,
    searchDrama,
    getDramaDetail,
    getEpisodes,
    getEpisode
  }
}
