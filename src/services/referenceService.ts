import api from './api'

export interface GenderOption {
  id: string
  name: string
}

// Normalizes various backend payload shapes to { id, name }
function mapGenderItem(item: any): GenderOption {
  const id: string = item?.id ?? item?.genderId ?? item?.code ?? ''
  const display: string =
    item?.name ?? item?.genderDisplayName ?? item?.genderName ??
    (id === 'M' ? 'Male' : id === 'F' ? 'Female' : id === 'O' ? 'Other' : String(id))
  return { id: String(id), name: String(display) }
}

export async function getGenders(): Promise<GenderOption[]> {
  const response = await api.get('/reference/genders')
  const data = Array.isArray(response.data) ? response.data : []
  return data.map(mapGenderItem)
}

export interface OptionItem {
  id: string
  name: string
}

function mapOccupationItem(item: any): OptionItem {
  const id = item?.id ?? item?.occupationId ?? item?.code ?? ''
  const name = item?.occupationDescription ?? item?.name ?? String(id)
  return { id: String(id), name: String(name) }
}

function mapMaritalStatusItem(item: any): OptionItem {
  const id = item?.id ?? item?.maritalStatusId ?? item?.code ?? ''
  const name = item?.name ??
    (id === 'U' ? 'Single' : id === 'M' ? 'Married' : id === 'D' ? 'Divorced' : id === 'W' ? 'Widowed' : String(id))
  return { id: String(id), name: String(name) }
}

export async function getOccupations(): Promise<OptionItem[]> {
  const response = await api.get('/reference/occupations')
  const data = Array.isArray(response.data) ? response.data : []
  return data.map(mapOccupationItem)
}

export async function getMaritalStatuses(): Promise<OptionItem[]> {
  const response = await api.get('/reference/marital-statuses')
  const data = Array.isArray(response.data) ? response.data : []
  return data.map(mapMaritalStatusItem)
}


export interface AreaItem {
  id: string
  name: string
  cityId?: string
  stateId?: string
}

function mapAreaItem(item: any): AreaItem {
  const id = item?.id ?? item?.areaId ?? item?.code ?? ''
  const name = item?.name ?? item?.areaName ?? String(id)
  return { id: String(id), name: String(name) }
}

export async function searchAreas(query?: string): Promise<AreaItem[]> {
  const trimmed = (query ?? '').trim()
  if (!trimmed) return []

  const response = await api.get('/reference/areas/search-advanced', {
    params: { searchStr: trimmed, languageId: 1 }
  })

  const payload = response?.data ?? {}
  const basicAreaSearch = Array.isArray(payload.basicAreaSearch) ? payload.basicAreaSearch : []

  return basicAreaSearch.map((item: any) => {
    const id = item?.areaId ?? item?.id ?? ''
    const name = item?.areaName ?? item?.name ?? String(id)
    const cityId = item?.cityId
    const stateId = item?.stateId
    return { id: String(id), name: String(name), cityId: cityId ? String(cityId) : undefined, stateId: stateId ? String(stateId) : undefined }
  })
}

export async function getAreaById(areaId: number, languageId: number = 1): Promise<{ areaId?: number; areaName?: string; cityId?: string; stateId?: string; countryId?: string; error?: string }> {
  try {
    const response = await api.get('/reference/areas/by-id', {
      params: { areaId, languageId }
    })
    return response.data || {}
  } catch (error: any) {
    console.error('Error fetching area by id:', error)
    return { error: error.response?.data?.error || error.message || 'Failed to fetch area by id' }
  }
}

export interface CityItem {
  id: string
  name: string
  stateId?: string
}

export async function searchCities(query?: string): Promise<CityItem[]> {
  const trimmed = (query ?? '').trim()
  if (!trimmed) return []

  const response = await api.get('/reference/cities/search', {
    params: { searchStr: trimmed, languageId: 1 }
  })

  const data = Array.isArray(response?.data) ? response.data : []
  return data
    .filter((item: any) => !item?.error)
    .map((item: any) => {
      const id = item?.cityId ?? item?.id ?? ''
      const name = item?.cityName ?? item?.name ?? String(id)
      const stateId = item?.stateId
      return { id: String(id), name: String(name), stateId: stateId ? String(stateId) : undefined }
    })
}

export async function getCitiesByState(stateId?: string): Promise<CityItem[]> {
  try {
    if (!stateId) {
      return []
    }

    // Use search endpoint with common search terms to get cities with translations
    // Then filter by stateId since the /cities endpoint returns entities without cityName
    const searchTerms = ['a', 'e', 'i', 'o', 'u', 'p', 'm', 'd']
    const allCitiesSet = new Set<string>()
    const allCities: CityItem[] = []

    for (const term of searchTerms) {
      try {
        const response = await api.get('/reference/cities/search', {
          params: { searchStr: term, languageId: 1 }
        })
        const data = Array.isArray(response?.data) ? response.data : []
        data
          .filter((item: any) => !item?.error)
          .forEach((item: any) => {
            const id = item?.cityId ?? item?.id ?? ''
            const name = item?.cityName ?? item?.name ?? String(id)
            const itemStateId = item?.stateId
            const key = `${id}-${name}`

            // Only add if not already added and matches the requested stateId
            if (!allCitiesSet.has(key) && itemStateId && String(itemStateId) === String(stateId)) {
              allCitiesSet.add(key)
              allCities.push({
                id: String(id),
                name: String(name),
                stateId: itemStateId ? String(itemStateId) : undefined
              })
            }
          })
      } catch (e) {
        console.warn(`Failed to search cities with term "${term}":`, e)
      }
    }

    // Sort by name for better UX
    return allCities.sort((a, b) => a.name.localeCompare(b.name))
  } catch (error) {
    console.error('Error fetching cities by state:', error)
    return []
  }
}


export interface ClinicItem {
  id: string
  name: string
}

function mapClinicItem(item: any): ClinicItem {
  const id = item?.id ?? item?.clinicId ?? item?.code ?? ''
  const name = item?.name ?? item?.clinicName ?? String(id)
  return { id: String(id), name: String(name) }
}

export async function getClinics(): Promise<ClinicItem[]> {
  const response = await api.get('/clinics')
  const data = Array.isArray(response?.data) ? response.data : []
  return data.map(mapClinicItem)
}

export interface FollowUpTypeItem {
  id: string
  followUpDescription: string
}

function mapFollowUpTypeItem(item: any): FollowUpTypeItem {
  const id = item?.id ?? item?.followUpTypeId ?? item?.code ?? ''
  const followUpDescription = item?.followUpDescription ?? item?.name ?? item?.description ?? String(id)
  return { id: String(id), followUpDescription: String(followUpDescription) }
}

export async function getFollowUpTypes(): Promise<FollowUpTypeItem[]> {
  const response = await api.get('/reference/follow-up-types')
  const data = Array.isArray(response?.data) ? response.data : []
  return data.map(mapFollowUpTypeItem)
}

export interface StateItem {
  id: string
  name: string
}

export async function getStates(countryId?: string, languageId: number = 1): Promise<StateItem[]> {
  try {
    const params: any = { languageId }
    if (countryId) {
      params.countryId = countryId
    }
    const response = await api.get('/reference/states', { params })
    const data = Array.isArray(response.data) ? response.data : []
    return data.map((item: any) => {
      // State entity has embedded id with stateId
      const id = item?.id?.id ?? item?.id ?? item?.stateId ?? ''
      // Priority: stateName from state_translations.state_name (from database), then name, then id
      const name = item?.stateName ?? item?.name ?? String(id)
      return { id: String(id), name: String(name) }
    })
  } catch (error) {
    console.error('Error fetching states:', error)
    return []
  }
}

// Helper function to get state name by stateId (fetches translation)
export async function getStateNameByStateId(stateId: string, languageId: number = 1): Promise<string | null> {
  try {
    // First try to get from all states
    const allStates = await getStates()
    const state = allStates.find(s => {
      const matches = s.id === stateId ||
        s.id?.toUpperCase() === stateId.toUpperCase() ||
        String(s.id) === String(stateId)
      return matches
    })
    if (state && state.name && state.name !== state.id) {
      return state.name
    }

    // If not found or name is just the ID, try using getAreaDetails with a dummy area
    // Actually, we can't do that without an area name

    // Return null if we can't find a proper name
    return null
  } catch (error) {
    console.error('Error fetching state name by stateId:', error)
    return null
  }
}

export async function getAreaDetails(areaName: string, languageId: number = 1): Promise<{ stateName?: string; stateId?: string; cityName?: string; cityId?: string } | null> {
  try {
    const response = await api.get('/reference/areas/details', {
      params: { areaName, languageId }
    })
    const data = response?.data ?? {}
    if (data.error) {
      console.error('Error getting area details:', data.error)
      return null
    }
    return {
      stateName: data.stateName,
      stateId: data.stateId,
      cityName: data.cityName,
      cityId: data.cityId
    }
  } catch (error) {
    console.error('Error fetching area details:', error)
    return null
  }
}

export async function getKeywords(): Promise<string[]> {
  try {
    const response = await api.get('/reference/keywords')
    return Array.isArray(response.data) ? response.data : []
  } catch (error) {
    console.error('Error fetching keywords:', error)
    return []
  }
}

export async function createArea(
  areaName: string,
  cityId: string,
  stateId: string,
  countryId: string = 'IND',
  languageId: number = 1
): Promise<{ success: boolean; areaId?: number; areaName?: string; message?: string; error?: string }> {
  try {
    const response = await api.post('/reference/areas/create', null, {
      params: {
        areaName,
        cityId,
        stateId,
        countryId,
        languageId
      }
    })
    return {
      success: response.data.success || false,
      areaId: response.data.areaId,
      areaName: response.data.areaName,
      message: response.data.message,
      error: response.data.error
    }
  } catch (error: any) {
    console.error('Error creating area:', error)
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to create area'
    }
  }
}

