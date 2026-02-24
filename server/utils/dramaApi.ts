const API_BASE = 'https://dramaqueen.iseries.my.id/api'

interface DramaEpisode {
  id: string
  episodeNumber: number
  videoUrl?: string
  link_720_premium?: string
  link_480?: string
  link_360?: string
  createdAt?: string
}

interface Drama {
  id: string
  title: string
  slug: string
  poster: string
  status?: string
  episodeCount?: number
}

interface DramaDetail extends Drama {
  episodes?: DramaEpisode[]
  totalEpisodes?: number
}

interface ApiResult<T> {
  success: boolean
  status: number
  message?: string
  data: T
}

async function fetchApi<T>(
  endpoint: string,
  params?: Record<string, string | number>
): Promise<T> {
  const url = new URL(`${API_BASE}${endpoint}`)
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value))
    })
  }
  
  const response = await fetch(url.toString(), {
    headers: {
      'x-api-key': '7a56ed7a117d0b58f841f827314fa95d927kdjn0okdkndjaebdndwkamvnfjdltdk'
    }
  })
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`)
  }
  
  const result: ApiResult<T> = await response.json()
  
  if (!result.success) {
    throw new Error(result.message || 'API request failed')
  }
  
  return result.data
}

export async function getLatestDramas(limit = 50): Promise<Drama[]> {
  return fetchApi<Drama[]>('/drama/latest', { limit })
}

export async function getDramaDetail(id: string): Promise<DramaDetail> {
  return fetchApi<DramaDetail>(`/drama/detail/${id}`)
}

export async function getDramaEpisodes(id: string): Promise<DramaEpisode[]> {
  return fetchApi<DramaEpisode[]>(`/drama/episodes/${id}`)
}

export async function getOngoingDramas(): Promise<Drama[]> {
  const latest = await getLatestDramas(100)
  
  const ongoingDramas: Drama[] = []
  
  for (const drama of latest) {
    try {
      const detail = await getDramaDetail(drama.id)
      
      if (detail.status?.toLowerCase().includes('ongoing') || 
          detail.status?.toLowerCase().includes('on going')) {
        ongoingDramas.push({
          ...drama,
          status: 'Ongoing',
          episodeCount: detail.totalEpisodes || detail.episodes?.length || 0
        })
      }
    } catch (error) {
      console.error(`Failed to get detail for drama ${drama.id}:`, error)
    }
  }
  
  return ongoingDramas
}

export type { Drama, DramaDetail, DramaEpisode }
