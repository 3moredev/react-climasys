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
  return data.map(mapReferByTranslation)
}


