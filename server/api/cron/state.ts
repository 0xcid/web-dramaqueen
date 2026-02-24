export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const context = event.context
  
  const kv = context.cloudflare?.env?.DRAMA_KV
  
  if (!kv) {
    return {
      success: false,
      error: 'KV namespace not available'
    }
  }
  
  try {
    const stateData = await kv.get('drama_state')
    
    if (!stateData) {
      return {
        success: true,
        state: {},
        message: 'No state stored yet'
      }
    }
    
    const state = JSON.parse(stateData)
    
    return {
      success: true,
      state,
      totalDramas: Object.keys(state).length
    }
  } catch (error) {
    console.error('Failed to get state:', error)
    return {
      success: false,
      error: 'Failed to retrieve state'
    }
  }
})
