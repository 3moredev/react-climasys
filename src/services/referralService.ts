import api from './api'

export interface ReferByOption {
  id: string
  name: string
}

function mapReferByTranslation(item: any): ReferByOption {
  const id = item?.id?.referId ?? item?.referId ?? item?.id ?? ''
  const name = item?.referByDescription ?? item?.name ?? String(id)
  return { id: String(id), name: String(name) }
}

export async function getReferByTranslations(languageId: number = 1): Promise<ReferByOption[]> {
  const response = await api.get('/referrals/refer-by/translations', {
    params: { languageId }
  })
  const data = Array.isArray(response?.data) ? response.data : []
  
  console.log('=== REFERRAL SERVICE DEBUG ===')
  console.log('Raw API response:', response?.data)
  console.log('Data array:', data)
  
  const mappedData = data.map(mapReferByTranslation)
  console.log('Mapped data:', mappedData)
  console.log('=== END REFERRAL SERVICE DEBUG ===')
  
  // Backend now handles deduplication, so we just return the mapped data
  return mappedData
}


