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
    return { id: String(id), name: String(name) }
  })
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
  const response = await api.get('/clinics/all')
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


export interface CountryItem {
  id: string
  name: string
}

export async function getCountries(): Promise<CountryItem[]> {
  const response = await api.get('/reference/countries')
  const data = Array.isArray(response?.data) ? response.data : []
  return data.map((item: any) => ({
    id: String(item?.id ?? item?.countryId ?? item?.code ?? ''),
    name: String(item?.name ?? item?.countryName ?? '')
  }))
}

export interface StateItem {
  id: string
  name: string
  countryId?: string
}

export async function getStates(countryId?: string): Promise<StateItem[]> {
  const url = countryId ? `/reference/states?countryId=${countryId}` : '/reference/states'
  const response = await api.get(url)
  const data = Array.isArray(response?.data) ? response.data : []
  return data.map((item: any) => ({
    id: String(item?.id ?? item?.stateId ?? item?.code ?? ''),
    name: String(item?.name ?? item?.stateName ?? ''),
    countryId: item?.countryId ? String(item.countryId) : undefined
  }))
}
