import React, { useState, useRef, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Alert,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Switch,
  CircularProgress
} from '@mui/material'
import Autocomplete from '@mui/material/Autocomplete'
import { DateField } from '@mui/x-date-pickers/DateField'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import { Close, Save, Person, Search, CalendarToday, Add } from '@mui/icons-material'
import { patientService, QuickRegistrationRequest } from '../services/patientService'
import { appointmentService, AppointmentRequest } from '../services/appointmentService'
import AddReferralPopup, { ReferralData } from '../components/AddReferralPopup'
import GlobalSnackbar from '../components/GlobalSnackbar'

interface AddPatientPageProps {
  open: boolean
  onClose: () => void
  onSave?: (patientData: any) => void
  doctorId?: string
  clinicId?: string
  patientId?: string
  readOnly?: boolean
}

export default function AddPatientPage({ open, onClose, onSave, doctorId, clinicId, patientId, readOnly = false }: AddPatientPageProps) {
  console.log('AddPatientPage rendered with props:', { open, patientId, readOnly, doctorId, clinicId });

  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    middleName: '',
    age: '',
    dateOfBirth: '',
    dobDate: null as any, // dayjs object for DateField
    field1: '',
    field2: 'Years',
    gender: '',
    area: '',
    city: '',
    patientId: '',
    maritalStatus: '',
    occupation: '',
    address: '',
    mobileNumber: '',
    email: '',
    state: 'Maharashtra',
    referredBy: '',
    referralName: '',
    referralContact: '',
    referralEmail: '',
    referralAddress: '',
    addToTodaysAppointment: true
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [genderOptions, setGenderOptions] = useState<{ id: string; name: string }[]>([])
  const [occupationOptions, setOccupationOptions] = useState<{ id: string; name: string }[]>([])
  const [maritalStatusOptions, setMaritalStatusOptions] = useState<{ id: string; name: string }[]>([])
  const [areaOptions, setAreaOptions] = useState<{ id: string; name: string; cityId?: string; stateId?: string }[]>([])
  const [areaInput, setAreaInput] = useState('')
  const [areaLoading, setAreaLoading] = useState(false)
  const [areaOpen, setAreaOpen] = useState(false)
  const [selectedAreaCityId, setSelectedAreaCityId] = useState<string | null>(null)
  const [cityOptions, setCityOptions] = useState<{ id: string; name: string; stateId?: string }[]>([])
  const [cityInput, setCityInput] = useState('')
  const [cityLoading, setCityLoading] = useState(false)
  const [referByOptions, setReferByOptions] = useState<{ id: string; name: string }[]>([])
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const dobInputRef = useRef<HTMLInputElement>(null)

  // Store doctorId and clinicId from props
  const [currentDoctorId, setCurrentDoctorId] = useState<string>('')
  const [currentClinicId, setCurrentClinicId] = useState<string>('')

  // Doctor referral search states
  const [referralNameSearch, setReferralNameSearch] = useState('')
  const [showReferralPopup, setShowReferralPopup] = useState(false)
  const [referralNameOptions, setReferralNameOptions] = useState<{ id: string; name: string; fullData?: any }[]>([])
  const [isSearchingReferral, setIsSearchingReferral] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null)

  // Update doctorId and clinicId when props change
  useEffect(() => {
    if (doctorId) {
      setCurrentDoctorId(doctorId)
      console.log('=== DOCTOR ID RECEIVED ===')
      console.log('Doctor ID from props:', doctorId)
    }
    if (clinicId) {
      setCurrentClinicId(clinicId)
      console.log('=== CLINIC ID RECEIVED ===')
      console.log('Clinic ID from props:', clinicId)
    }
  }, [doctorId, clinicId])

  // Log when open prop changes
  useEffect(() => {
    console.log('AddPatientPage - open prop changed:', open, 'patientId:', patientId, 'readOnly:', readOnly);
  }, [open, patientId, readOnly]);

  // Fetch patient data when patientId is provided
  useEffect(() => {
    if (patientId && open) {
      const fetchPatientData = async () => {
        try {
          setLoading(true)
          console.log('📥 Fetching patient data for ID:', patientId)
          // The backend accepts both id (number) and folder_no (string) formats
          const patient: any = await patientService.getPatient(patientId)
          console.log('📦 Patient data received:', patient)

          // Convert date_of_birth to dayjs object for DateField
          let dobDate = null
          if (patient.date_of_birth) {
            try {
              const parsedDate = dayjs(patient.date_of_birth)
              if (parsedDate.isValid()) {
                // DateField component expects dayjs object, not Date object
                dobDate = parsedDate as any // Keep as dayjs object
                console.log('📅 Parsed DOB:', parsedDate.format('DD/MM/YYYY'), 'from:', patient.date_of_birth)
              } else {
                console.warn('⚠️ Invalid date format:', patient.date_of_birth)
              }
            } catch (e) {
              console.error('Error parsing date_of_birth:', e)
            }
          }

          // Fetch area name if area_id exists
          let areaName = ''
          if (patient.area_id) {
            try {
              console.log('🔍 Searching for area with ID:', patient.area_id)
              const { searchAreas } = await import('../services/referenceService')
              // Try searching with common terms to find the area
              const searchTerms = ['pune', 'mumbai', 'delhi', 'a']
              let matchingArea = null

              for (const term of searchTerms) {
                try {
                  const searchResults = await searchAreas(term)
                  matchingArea = searchResults.find(a => {
                    const areaIdNum = parseInt(a.id)
                    return areaIdNum === patient.area_id || areaIdNum === parseInt(String(patient.area_id))
                  })
                  if (matchingArea) {
                    console.log(`✅ Found area with term "${term}":`, matchingArea.name)
                    break
                  }
                } catch (e) {
                  console.warn(`Search failed for term "${term}":`, e)
                }
              }

              if (matchingArea) {
                areaName = matchingArea.name
                // Preserve cityId and stateId if available from API response
                const areaWithCityId = {
                  ...matchingArea,
                  cityId: (matchingArea as any).cityId || undefined,
                  stateId: (matchingArea as any).stateId || undefined
                }
                // Add area to options first, then set input
                setAreaOptions(prev => {
                  if (!prev.find(o => o.id === matchingArea.id)) {
                    return [...prev, areaWithCityId]
                  }
                  return prev
                })

                // Fetch City and State based on area's cityId and stateId from database (must match exactly)
                const fetchCityAndStateForLoadedArea = async () => {
                  try {
                    const { searchCities, getStates, getAreaDetails } = await import('../services/referenceService')
                    const areaCityId = areaWithCityId.cityId
                    const areaStateId = areaWithCityId.stateId
                    let matchingCity: { id: string; name: string; stateId?: string } | null = null

                    // First, try to get stateName directly from area details (this includes stateName from state_translations.state_name)
                    let stateNameFromArea: string | null = null
                    if (areaStateId) {
                      try {
                        const areaDetails = await getAreaDetails(areaName, 1)
                        if (areaDetails?.stateName) {
                          stateNameFromArea = areaDetails.stateName
                          console.log(`✅ Got stateName from area details for loaded patient:`, stateNameFromArea)
                        }
                      } catch (e) {
                        console.warn('Could not get area details for stateName:', e)
                      }
                    }

                    // Step 1: Fetch city using area's cityId (must match exactly)
                    if (areaCityId) {
                      const searchTerms = ['a', 'e', 'i', 'o', 'u', 'p', 'm', 'd']

                      for (const term of searchTerms) {
                        try {
                          const results = await searchCities(term)
                          matchingCity = results.find(city => {
                            const matches = city.id === areaCityId ||
                              city.id?.toUpperCase() === areaCityId.toUpperCase() ||
                              String(city.id) === String(areaCityId)
                            return matches
                          }) || null
                          if (matchingCity) {
                            console.log(`✅ Found city for loaded area (cityId: ${areaCityId}):`, matchingCity.name)
                            break
                          }
                        } catch (e) {
                          console.warn(`Search failed for term "${term}":`, e)
                        }
                      }

                      if (matchingCity) {
                        // Update city in form data
                        setFormData(prev => ({ ...prev, city: matchingCity!.name }))
                        setCityInput(matchingCity.name)
                      } else {
                        console.warn('⚠️ Could not find city for area cityId:', areaCityId)
                      }
                    }

                    // Step 2: Fetch state using area's stateId (must match exactly from database)
                    // Priority: 1) stateName from area details (state_translations.state_name), 2) from getStates, 3) fallback to city
                    if (areaStateId) {
                      try {
                        // First, use stateName from area details if available (this comes from state_translations.state_name)
                        if (stateNameFromArea) {
                          setFormData(prev => ({ ...prev, state: stateNameFromArea }))
                          console.log(`✅ Using stateName from area details for loaded patient (stateId: ${areaStateId}):`, stateNameFromArea)
                        } else {
                          // Fallback: try to get from getStates
                          const allStates = await getStates()
                          const matchingState = allStates.find(state => {
                            const matches = state.id === areaStateId ||
                              state.id?.toUpperCase() === areaStateId.toUpperCase() ||
                              String(state.id) === String(areaStateId)
                            return matches
                          })
                          if (matchingState && matchingState.name && matchingState.name !== matchingState.id) {
                            setFormData(prev => ({ ...prev, state: matchingState.name }))
                            console.log(`✅ Found state from getStates for loaded patient (stateId: ${areaStateId}):`, matchingState.name)
                          } else {
                            console.warn('⚠️ Could not find state name for area stateId:', areaStateId)
                            // Fallback: try to get state from city if available
                            if (matchingCity?.stateId) {
                              const cityStateId = matchingCity.stateId
                              const cityStateMatch = allStates.find(state => {
                                const matches = state.id === cityStateId ||
                                  state.id?.toUpperCase() === cityStateId.toUpperCase() ||
                                  String(state.id) === String(cityStateId)
                                return matches
                              })
                              if (cityStateMatch && cityStateMatch.name && cityStateMatch.name !== cityStateMatch.id) {
                                setFormData(prev => ({ ...prev, state: cityStateMatch.name }))
                                console.log(`✅ Found state from city fallback (stateId: ${cityStateId}):`, cityStateMatch.name)
                              }
                            }
                          }
                        }
                      } catch (e) {
                        console.error('Error fetching state for loaded area:', e)
                      }
                    } else if (matchingCity?.stateId) {
                      // Fallback: use city's stateId if area doesn't have stateId
                      try {
                        const allStates = await getStates()
                        const cityStateId = matchingCity.stateId
                        const matchingState = allStates.find(state => {
                          const matches = state.id === cityStateId ||
                            state.id?.toUpperCase() === cityStateId.toUpperCase() ||
                            String(state.id) === String(cityStateId)
                          return matches
                        })
                        if (matchingState && matchingState.name && matchingState.name !== matchingState.id) {
                          setFormData(prev => ({ ...prev, state: matchingState.name }))
                          console.log(`✅ Found state from city for loaded patient (stateId: ${cityStateId}):`, matchingState.name)
                        }
                      } catch (e) {
                        console.error('Error fetching state from city:', e)
                      }
                    }
                  } catch (e) {
                    console.error('Error fetching city and state for loaded area:', e)
                  }
                }
                fetchCityAndStateForLoadedArea()

                // Set areaInput after a small delay to ensure options are updated
                // Close dropdown when patching data
                setTimeout(() => {
                  setAreaInput(areaName)
                  setAreaOpen(false) // Ensure dropdown is closed when patching
                  // Store cityId for filtering cities
                  if (areaWithCityId.cityId) {
                    setSelectedAreaCityId(areaWithCityId.cityId)
                    console.log('📋 Stored area cityId for filtering:', areaWithCityId.cityId)
                  }
                }, 0)
              } else {
                console.warn('⚠️ Could not find area with ID:', patient.area_id, '- will try to fetch later when user searches')
              }
            } catch (e) {
              console.error('Error fetching area:', e)
            }
          }

          // Fetch city name if city_id exists
          let cityName = ''
          if (patient.city_id) {
            try {
              console.log('🔍 Searching for city with ID:', patient.city_id)
              const { searchCities } = await import('../services/referenceService')
              // Try multiple search terms - city IDs are usually short codes like "PU", "MU", etc.
              const searchTerms = ['pune', 'mumbai', 'delhi', 'a']
              let matchingCity = null

              for (const term of searchTerms) {
                try {
                  const searchResults = await searchCities(term)
                  matchingCity = searchResults.find(c => {
                    // City ID might be case-sensitive, so check both
                    return c.id === patient.city_id ||
                      c.id?.toUpperCase() === String(patient.city_id).toUpperCase() ||
                      c.id === String(patient.city_id)
                  })
                  if (matchingCity) {
                    console.log(`✅ Found city with term "${term}":`, matchingCity.name)
                    break
                  }
                } catch (e) {
                  console.warn(`Search failed for term "${term}":`, e)
                }
              }

              if (matchingCity) {
                cityName = matchingCity.name
                setCityInput(cityName)
                // Filter cities to only show the one matching patient.city_id
                setCityOptions([matchingCity])
                console.log('📋 Set city options to filtered city:', matchingCity)
              } else {
                console.warn('⚠️ Could not find city with ID:', patient.city_id, '- will try to fetch later when user searches')
                // Set city_id as fallback if we can't find the name
                if (patient.city_id) {
                  setCityInput(String(patient.city_id))
                }
              }
            } catch (e) {
              console.error('Error fetching city:', e)
            }
          }

          // Map patient data to form fields
          try {
            const addressParts = []
            if (patient.address_1) addressParts.push(patient.address_1)
            if (patient.address_2) addressParts.push(patient.address_2)
            const fullAddress = addressParts.join(', ') || ''

            // Set formData with area and city names (they should be in options by now)
            setFormData(prev => ({
              ...prev,
              patientId: patientId,
              firstName: patient.first_name || '',
              middleName: patient.middle_name || '',
              lastName: patient.last_name || '',
              mobileNumber: patient.mobile_1 || '',
              age: patient.age_given?.toString() || '',
              dateOfBirth: patient.date_of_birth || '',
              dobDate: dobDate,
              field1: patient.age_given?.toString() || '',
              field2: 'Years', // Default to Years
              gender: patient.gender_id ? String(patient.gender_id) : '',
              area: areaName || prev.area,
              city: cityName || prev.city,
              state: patient.state_id || prev.state || 'Maharashtra',
              address: fullAddress,
              email: patient.email_id || '',
              occupation: patient.occupation_id ? String(patient.occupation_id) : '',
              maritalStatus: patient.marital_status_id ? String(patient.marital_status_id) : '',
              // Referral fields from patient_master table
              referredBy: patient.refer_id || prev.referredBy || '',
              referralName: patient.refer_doctor_details || prev.referralName || '',
              referralContact: patient.doctor_mobile || prev.referralContact || '',
              referralEmail: patient.doctor_email || prev.referralEmail || '',
              referralAddress: patient.doctor_address || prev.referralAddress || '',
            }))

            // Ensure areaInput is synced with the area name
            if (areaName) {
              setAreaInput(areaName)
            }

            console.log('✅ Patient data mapped to form successfully')
            console.log('📍 Area name:', areaName, 'Area input:', areaInput)
          } catch (mappingError) {
            console.error('❌ Error mapping patient data:', mappingError)
            throw mappingError
          }
        } catch (error: any) {
          console.error('❌ Error fetching patient data:', error)
          setSnackbarMessage(error.message || 'Failed to load patient data')
          setSnackbarOpen(true)
        } finally {
          setLoading(false)
        }
      }
      fetchPatientData()
    }
  }, [patientId, open])

  // Function to map form data to API request format
  const mapFormDataToApiRequest = (): QuickRegistrationRequest => {
    // Get the selected area, city, gender, marital status, and occupation objects
    const selectedArea = areaOptions.find(opt => opt.name === formData.area)
    const selectedCity = cityOptions.find(opt => opt.name === formData.city)
    const selectedGender = genderOptions.find(opt => opt.id === formData.gender)
    const selectedMaritalStatus = maritalStatusOptions.find(opt => opt.id === formData.maritalStatus)
    const selectedOccupation = occupationOptions.find(opt => opt.id === formData.occupation)
    const selectedReferBy = referByOptions.find(opt => opt.id === formData.referredBy)
    // referId is char(1) in DB; guard against longer values (e.g., "Self")
    const normalizedReferId = (() => {
      const raw = selectedReferBy ? selectedReferBy.id : (formData.referredBy || '')
      if (!raw) return ''
      return String(raw).trim().charAt(0) // ensure max length 1
    })()

    console.log('=== MAPPING FORM DATA TO API REQUEST ===')
    console.log('Selected Area:', selectedArea)
    console.log('Selected City:', selectedCity)
    console.log('Selected Gender:', selectedGender)
    console.log('Selected Marital Status:', selectedMaritalStatus)
    console.log('Selected Occupation:', selectedOccupation)
    console.log('Selected Refer By:', selectedReferBy)

    // Derive cityId/stateId from selected area/city to match DB values
    const derivedCityId =
      selectedArea?.cityId ||
      selectedCity?.id ||
      ''

    const derivedStateId =
      selectedArea?.stateId ||
      selectedCity?.stateId ||
      ''

    const apiRequest: QuickRegistrationRequest = {
      doctorId: currentDoctorId,
      lastName: formData.lastName,
      middleName: formData.middleName || '',
      firstName: formData.firstName,
      mobile: formData.mobileNumber,
      areaId: selectedArea ? parseInt(selectedArea.id) : undefined,
      cityId: derivedCityId || 'PU', // Fallback to 'PU' if nothing derived
      stateId: derivedStateId || 'MAH', // Fallback to 'MAH' if nothing derived
      countryId: 'IND', // Default to India
      dob: formData.dateOfBirth || undefined,
      age: formData.age || undefined,
      gender: selectedGender ? selectedGender.id : formData.gender,
      regYear: '5', // Match Swagger format
      registrationStatus: 'P', // Default to 'P' for Pending
      userId: 'Recep2', // You might want to get this from session
      referBy: normalizedReferId,
      referDoctorDetails: formData.referralName || '',
      maritalStatus: selectedMaritalStatus ? selectedMaritalStatus.id : '',
      occupation: selectedOccupation ? parseInt(selectedOccupation.id) : undefined,
      address: formData.address || '',
      patientEmail: formData.email || '',
      doctorAddress: formData.referralAddress || '',
      doctorMobile: formData.referralContact || '',
      doctorEmail: formData.referralEmail || '',
      clinicId: currentClinicId
    }

    console.log('=== FINAL API REQUEST ===')
    console.log('API Request Object:', apiRequest)
    console.log('API Request JSON:', JSON.stringify(apiRequest, null, 2))

    return apiRequest
  }

  useEffect(() => {
    let cancelled = false
    async function loadGenders() {
      try {
        const { getGenders } = await import('../services/referenceService')
        const genders = await getGenders()
        if (!cancelled) setGenderOptions(genders)
      } catch (e) {
        console.error('Failed to load genders', e)
      }
    }
    async function loadOccupations() {
      try {
        const { getOccupations } = await import('../services/referenceService')
        const items = await getOccupations()
        if (!cancelled) setOccupationOptions(items)
      } catch (e) {
        console.error('Failed to load occupations', e)
      }
    }
    async function loadMaritalStatuses() {
      try {
        const { getMaritalStatuses } = await import('../services/referenceService')
        const items = await getMaritalStatuses()
        if (!cancelled) setMaritalStatusOptions(items)
      } catch (e) {
        console.error('Failed to load marital statuses', e)
      }
    }
    async function loadReferBy() {
      try {
        const { getReferByTranslations } = await import('../services/referralService')
        const items = await getReferByTranslations(1)
        if (!cancelled) setReferByOptions(items)
      } catch (e) {
        console.error('Failed to load refer-by options', e)
      }
    }

    loadGenders()
    loadOccupations()
    loadMaritalStatuses()
    loadReferBy()
    return () => {
      cancelled = true
    }
  }, [])

  // Sync referralNameSearch with formData.referralName when data is loaded
  useEffect(() => {
    if (formData.referralName && formData.referralName.trim() !== '' && referralNameSearch !== formData.referralName) {
      setReferralNameSearch(formData.referralName)
    }
  }, [formData.referralName])

  // Auto-match referralName from saved data with referral doctors and patch fields
  useEffect(() => {
    let cancelled = false
    async function tryAutofillDoctorFromReferralName() {
      if (!open) return
      const name = (formData.referralName || '').trim()
      if (!name) return
      // Only auto-match if referralBy is 'D' (Doctor) or if we have referral contact details
      const isDoctorReferral = formData.referredBy === 'D'
      const hasReferralDetails = formData.referralContact || formData.referralEmail || formData.referralAddress

      // If it's not a doctor referral and we don't have details, skip
      if (!isDoctorReferral && !hasReferralDetails) return

      // If selectedDoctor is already set, don't re-run
      if (selectedDoctor !== null) return

      try {
        const { getReferralDoctors } = await import('../services/referralService')
        const doctors = await getReferralDoctors(1)
        const match = doctors.find(d => (d.doctorName || '').trim().toLowerCase() === name.toLowerCase())
        if (!cancelled && match) {
          setSelectedDoctor(match as any)
          setFormData(prev => ({
            ...prev,
            referredBy: 'D', // Ensure it's set to 'D'
            referralName: match.doctorName || prev.referralName,
            // Use saved values from API if they exist, otherwise use doctor's default values
            referralContact: prev.referralContact || match.doctorMob || '',
            referralEmail: prev.referralEmail || (match as any).doctorMail || match.doctorEmail || '',
            referralAddress: prev.referralAddress || (match as any).doctorAddress || match.doctorAddress || ''
          }))
          setReferralNameSearch(match.doctorName || name)
        } else if (!cancelled && isDoctorReferral && hasReferralDetails) {
          // If we have a doctor referral with details but no match found, 
          // still set selectedDoctor to indicate it's a doctor (even if not in the list)
          // This allows the fields to remain populated from saved data and shows regular text field
          setSelectedDoctor({
            doctorName: name,
            doctorMob: formData.referralContact,
            doctorMail: formData.referralEmail,
            doctorAddress: formData.referralAddress
          } as any)
          setReferralNameSearch(name)
        }
      } catch (e) {
        console.error('Failed to auto-match referralName to doctor', e)
      }
    }
    tryAutofillDoctorFromReferralName()
    return () => { cancelled = true }
  }, [open, formData.referralName, formData.referredBy, formData.referralContact, formData.referralEmail, formData.referralAddress])

  // Sync areaInput with formData.area when dialog opens or formData.area is set externally
  // Only sync when data is being patched (not when user is actively editing)
  useEffect(() => {
    if (open && formData.area && formData.area.trim() !== '' && formData.area !== 'pune') {
      // Only sync if areaInput is empty or doesn't match formData.area
      // But don't sync if user is actively editing (input exists and doesn't match)
      const isUserEditing = areaInput && areaInput.trim() !== '' && areaInput !== formData.area
      if (!isUserEditing && (!areaInput || areaInput !== formData.area)) {
        setAreaInput(formData.area)
        setAreaOpen(false) // Close dropdown when syncing patched data
        // Also ensure the area is in options if it's not already there
        if (areaOptions.length > 0 && !areaOptions.find(o => o.name === formData.area)) {
          // If area is not in options, try to search for it
          const searchArea = async () => {
            try {
              const { searchAreas } = await import('../services/referenceService')
              const results = await searchAreas(formData.area)
              const match = results.find(a => a.name === formData.area)
              if (match) {
                setAreaOptions(prev => {
                  if (!prev.find(o => o.id === match.id)) {
                    return [...prev, match]
                  }
                  return prev
                })
                // Don't open dropdown when adding option for patched data
                setAreaOpen(false)
              }
            } catch (e) {
              console.error('Error searching for area:', e)
            }
          }
          searchArea()
        }
      }
    }
  }, [open, formData.area, areaInput, areaOptions])

  useEffect(() => {
    let active = true
    const fetchAreas = async () => {
      try {
        setAreaLoading(true)
        console.log('🔍 Searching areas with query:', areaInput)
        const { searchAreas } = await import('../services/referenceService')
        const results = await searchAreas(areaInput)
        console.log('✅ Area search results:', results)
        if (active) {
          // Map results to include cityId and stateId from API response (matching database structure)
          const mappedResults = results.map((item: any) => ({
            id: item.id || item.areaId || '',
            name: item.name || item.areaName || '',
            cityId: item.cityId || undefined,
            stateId: item.stateId || undefined
          }))
          setAreaOptions(mappedResults)
          // Open dropdown if we have results and user is actively searching
          // Allow opening even if input matches selected value (user might want to change it)
          if (mappedResults.length > 0 && areaInput && areaInput.trim().length > 0) {
            // Only prevent opening if this is initial data patching (no user interaction)
            // We'll let onOpen handler control this instead
            // Don't auto-open here - let user interaction control it
          }
        }
      } catch (e) {
        console.error('❌ Failed to search areas', e)
        if (active) setAreaOptions([])
      } finally {
        if (active) setAreaLoading(false)
      }
    }

    // Only search if there's input (at least 1 character)
    const trimmedInput = areaInput?.trim() || ''
    if (trimmedInput.length > 0) {
      // Debounce user input
      const handle = setTimeout(() => {
        fetchAreas()
      }, 300)

      return () => {
        active = false
        clearTimeout(handle)
      }
    } else {
      // Clear options when input is empty
      if (active) {
        setAreaOptions([])
        console.log('🧹 Cleared area options (empty input)')
      }
      return () => {
        active = false
      }
    }
  }, [areaInput, formData.area])

  useEffect(() => {
    let active = true

    // Get the area's cityId - check selectedAreaCityId first, then areaOptions, then formData.area
    const getAreaCityId = (): string | null => {
      if (selectedAreaCityId) {
        return selectedAreaCityId
      }
      if (formData.area && areaOptions.length > 0) {
        const selectedArea = areaOptions.find(a => a.name === formData.area)
        if (selectedArea?.cityId) {
          // Store it for future use
          setSelectedAreaCityId(selectedArea.cityId)
          return selectedArea.cityId
        }
      }
      return null
    }

    const fetchCities = async () => {
      try {
        setCityLoading(true)
        const { searchCities } = await import('../services/referenceService')

        // Get area's cityId
        const areaCityId = getAreaCityId()

        // If there's input, search with that input
        // If no input but area is selected, use a broad search to get cities
        const searchTerm = cityInput && cityInput.trim().length > 0
          ? cityInput.trim()
          : (areaCityId ? 'a' : '') // Use 'a' to get cities if area is selected but no input

        if (!searchTerm && !areaCityId) {
          // No search term and no area selected - clear options
          if (active) setCityOptions([])
          return
        }

        // Search cities
        const allResults = await searchCities(searchTerm)

        // Always filter by area's cityId if an area is selected
        let filteredResults = allResults
        if (areaCityId) {
          filteredResults = allResults.filter(city => {
            const matches = city.id === areaCityId ||
              city.id?.toUpperCase() === areaCityId.toUpperCase() ||
              String(city.id) === String(areaCityId)
            return matches
          })
          console.log('🔍 Filtering cities by area cityId:', areaCityId)
          console.log('📊 Search term:', searchTerm, 'Total results:', allResults.length, 'Filtered:', filteredResults.length)
          console.log('📋 Filtered cities:', filteredResults)
        } else {
          console.log('⚠️ No area selected, showing all cities')
        }

        if (active) setCityOptions(filteredResults)
      } catch (e) {
        console.error('Failed to search cities', e)
        if (active) setCityOptions([])
      } finally {
        if (active) setCityLoading(false)
      }
    }

    // Search if there's input OR if area is selected (to load related cities)
    if (cityInput && cityInput.trim().length > 0) {
      // Debounce user input
      const handle = setTimeout(() => {
        fetchCities()
      }, 300)

      return () => {
        active = false
        clearTimeout(handle)
      }
    } else if (selectedAreaCityId || (formData.area && areaOptions.length > 0)) {
      // If area is selected but no city input, load cities for that area
      // Try multiple search terms to get more cities, then filter by area's cityId
      const handle = setTimeout(() => {
        const loadCitiesForArea = async () => {
          try {
            setCityLoading(true)
            const { searchCities } = await import('../services/referenceService')
            // Try multiple common search terms to get more cities
            const searchTerms = ['a', 'e', 'i', 'o', 'u', 'p', 'm', 'd']
            const allResultsSet = new Set<string>()
            const allResults: Array<{ id: string; name: string; stateId?: string }> = []

            // Search with multiple terms and combine results
            for (const term of searchTerms) {
              try {
                const results = await searchCities(term)
                results.forEach(city => {
                  const key = `${city.id}-${city.name}`
                  if (!allResultsSet.has(key)) {
                    allResultsSet.add(key)
                    allResults.push(city)
                  }
                })
              } catch (e) {
                console.warn(`Failed to search cities with term "${term}":`, e)
              }
            }

            console.log('📋 Total cities found:', allResults.length)

            // Filter cities based on selected area's cityId
            let filteredResults = allResults
            if (selectedAreaCityId) {
              filteredResults = allResults.filter(city => {
                const matches = city.id === selectedAreaCityId ||
                  city.id?.toUpperCase() === selectedAreaCityId.toUpperCase() ||
                  String(city.id) === String(selectedAreaCityId)
                return matches
              })
              console.log('🔍 Filtered cities for area (cityId:', selectedAreaCityId, '):', filteredResults)
              console.log('📊 Filter details:', {
                selectedAreaCityId,
                totalCities: allResults.length,
                filteredCount: filteredResults.length,
                sampleCityIds: allResults.slice(0, 5).map(c => c.id)
              })
            } else if (formData.area) {
              // Try to get cityId from areaOptions
              const selectedArea = areaOptions.find(a => a.name === formData.area)
              const areaCityId = selectedArea?.cityId
              if (areaCityId) {
                setSelectedAreaCityId(areaCityId)
                filteredResults = allResults.filter(city => {
                  const matches = city.id === areaCityId ||
                    city.id?.toUpperCase() === areaCityId.toUpperCase() ||
                    String(city.id) === String(areaCityId)
                  return matches
                })
                console.log('🔍 Loaded cities for area (from options, cityId:', areaCityId, '):', filteredResults)
              } else {
                // If no cityId, show all cities (fallback)
                filteredResults = allResults
                console.log('⚠️ No cityId found for area, showing all cities')
              }
            }

            if (active) setCityOptions(filteredResults)
          } catch (e) {
            console.error('Failed to load cities for area', e)
            if (active) setCityOptions([])
          } finally {
            if (active) setCityLoading(false)
          }
        }
        loadCitiesForArea()
      }, 300)

      return () => {
        active = false
        clearTimeout(handle)
      }
    } else {
      // Clear options when input is empty and no area selected
      if (active) setCityOptions([])
      return () => {
        active = false
      }
    }
  }, [cityInput, selectedAreaCityId, formData.area, areaOptions])

  // Helper function to handle numeric-only input with max 10 digits
  const handleNumericInput = (value: string): string => {
    // Remove all non-numeric characters
    const numericValue = value.replace(/\D/g, '')
    // Limit to 10 digits
    return numericValue.length <= 10 ? numericValue : numericValue.slice(0, 10)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      // Convert firstName, middleName, and lastName to uppercase
      let processedValue = value
      if (field === 'firstName' || field === 'middleName' || field === 'lastName') {
        processedValue = value.toUpperCase()
      }
      // Handle numeric-only input for mobileNumber and referralContact
      if (field === 'mobileNumber' || field === 'referralContact') {
        processedValue = handleNumericInput(value)
      }

      const next = { ...prev, [field]: processedValue }
      // Reverse sync: when Age (field1) changes, compute DoB using today's month/day
      if (field === 'field1') {
        const trimmed = String(value || '').trim()
        if (trimmed === '') {
          next.dobDate = null
          next.dateOfBirth = ''
        } else {
          const num = parseInt(trimmed, 10)
          if (Number.isFinite(num) && num >= 0) {
            const unit = next.field2 || 'Years'
            const base = dayjs()
            const dob = unit === 'Months' ? base.subtract(num, 'month') : base.subtract(num, 'year')
            next.dobDate = dob as unknown as Date // keep compatibility with DateField usage
            next.dateOfBirth = dob.format('YYYY-MM-DD')
            if (unit === 'Years') {
              next.age = String(num)
            }
          }
        }
      }
      // If unit (Years/Months) changes and we have a numeric age, recompute DoB from today
      if (field === 'field2') {
        const trimmed = String(next.field1 || '').trim()
        const num = parseInt(trimmed, 10)
        if (Number.isFinite(num) && num >= 0) {
          const base = dayjs()
          const dob = value === 'Months' ? base.subtract(num, 'month') : base.subtract(num, 'year')
          next.dobDate = dob as unknown as Date
          next.dateOfBirth = dob.format('YYYY-MM-DD')
          if (value === 'Years') {
            next.age = String(num)
          }
        }
      }

      // Reset referral name search when referral type changes
      if (field === 'referredBy') {
        if (value !== 'D') {
          // Clear selected doctor if not a doctor referral
          setSelectedDoctor(null)
          setReferralNameSearch('')
          setReferralNameOptions([])
        } else {
          // If changing to 'D', sync referralNameSearch with referralName if it exists
          if (next.referralName && next.referralName.trim() !== '') {
            setReferralNameSearch(next.referralName)
          }
        }
      }

      return next
    })
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Search referral names when typing
  const handleReferralNameSearch = async (searchTerm: string) => {
    setReferralNameSearch(searchTerm)
    if (searchTerm.length < 2) {
      setReferralNameOptions([])
      return
    }

    setIsSearchingReferral(true)
    try {
      // Call the actual referral doctors API
      const { getReferralDoctors } = await import('../services/referralService')
      const doctors = await getReferralDoctors(1) // languageId = 1

      console.log('=== REFERRAL DOCTORS SEARCH DEBUG ===')
      console.log('Search term:', searchTerm)
      console.log('All doctors from API:', doctors)

      // Filter doctors by name containing the search term
      const filteredDoctors = doctors.filter(doctor =>
        doctor.doctorName.toLowerCase().includes(searchTerm.toLowerCase())
      )

      console.log('Filtered doctors:', filteredDoctors)

      // Store the full doctor data for later use
      setReferralNameOptions(filteredDoctors.map(doctor => ({
        id: doctor.rdId.toString(),
        name: doctor.doctorName,
        fullData: doctor // Store the complete doctor object
      })))

      console.log('Mapped results for dropdown:', filteredDoctors.map(doctor => ({
        id: doctor.rdId.toString(),
        name: doctor.doctorName,
        fullData: doctor
      })))
      console.log('=== END REFERRAL DOCTORS SEARCH DEBUG ===')
    } catch (error) {
      console.error('Error searching referral names:', error)
      setReferralNameOptions([])
    } finally {
      setIsSearchingReferral(false)
    }
  }

  // Check if current referral by is a doctor (specifically referId "D")
  const isDoctorReferral = () => {
    return formData.referredBy === 'D'
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.gender) newErrors.gender = 'Gender is required'
    if (!formData.area.trim()) newErrors.area = 'Area is required'

    // Validate date of birth
    if (!formData.dateOfBirth || !formData.dobDate) {
      newErrors.dateOfBirth = 'Date of birth is required'
    }

    // Validate age
    if (!formData.age.trim()) newErrors.age = 'Age is required'

    // Validate mobile number format - must be exactly 10 digits
    if (formData.mobileNumber && formData.mobileNumber.length !== 10) {
      newErrors.mobileNumber = formData.mobileNumber.length > 0
        ? 'Mobile number must be exactly 10 digits'
        : ''
    }

    // Validate referral contact format - must be exactly 10 digits if provided
    if (formData.referralContact && formData.referralContact.length > 0 && formData.referralContact.length !== 10) {
      newErrors.referralContact = 'Referral contact must be exactly 10 digits'
    }

    // Validate email if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Validate referral email if provided
    if (formData.referralEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.referralEmail)) {
      newErrors.referralEmail = 'Please enter a valid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    console.log('=== FORM SUBMISSION STARTED ===')
    console.log('Form validation result:', validateForm())
    console.log('Current Doctor ID:', currentDoctorId)
    console.log('Current Clinic ID:', currentClinicId)

    if (!validateForm()) {
      console.log('Form validation failed, stopping submission')
      return
    }

    console.log('=== FORM DATA BEFORE PROCESSING ===')
    console.log('Raw form data:', formData)
    console.log('Form data keys:', Object.keys(formData))
    console.log('Form data values:', Object.values(formData))

    // Log individual field values
    console.log('=== INDIVIDUAL FIELD VALUES ===')
    // console.log('Family Folder:', formData.familyFolder)
    console.log('First Name:', formData.firstName)
    console.log('Middle Name:', formData.middleName)
    console.log('Last Name:', formData.lastName)
    console.log('Age:', formData.age)
    console.log('Date of Birth:', formData.dateOfBirth)
    console.log('Gender:', formData.gender)
    console.log('Area:', formData.area)
    console.log('City:', formData.city)
    console.log('State:', formData.state)
    console.log('Marital Status:', formData.maritalStatus)
    console.log('Occupation:', formData.occupation)
    console.log('Address:', formData.address)
    console.log('Mobile Number:', formData.mobileNumber)
    console.log('Email:', formData.email)
    console.log('Referred By:', formData.referredBy)
    console.log('Referral Name:', formData.referralName)
    console.log('Referral Contact:', formData.referralContact)
    console.log('Referral Email:', formData.referralEmail)
    console.log('Referral Address:', formData.referralAddress)
    console.log('Add to Today\'s Appointment:', formData.addToTodaysAppointment)

    setLoading(true)
    try {
      console.log('=== CALLING PATIENT REGISTRATION API ===')
      console.log('Starting patient registration API call...')

      // Map form data to API request format
      const apiRequest = mapFormDataToApiRequest()

      // Call the patient registration API
      const response = await patientService.quickRegister(apiRequest)

      console.log('=== API RESPONSE ===')
      console.log('API Response:', response)

      // Check for successful registration based on backend response format
      if (response.SAVE_STATUS === 1 || response.success) {
        console.log('=== PATIENT REGISTRATION SUCCESSFUL ===')
        console.log('Patient ID:', response.ID)
        console.log('Save Status:', response.SAVE_STATUS)
        console.log('Message:', response.message)

        // Create patient data for callback
        const patientData = {
          ...formData,
          patientId: response.ID || `PAT-${Date.now().toString().slice(-6)}`,
          fullName: `${formData.firstName} ${formData.lastName}`,
          registrationDate: new Date().toISOString().split('T')[0],
          doctorId: currentDoctorId,
          clinicId: currentClinicId,
          apiResponse: response
        }

        console.log('=== FINAL PATIENT DATA TO BE SAVED ===')
        console.log('Complete patient data object:', patientData)
        console.log('Patient ID:', patientData.patientId)
        console.log('Full Name:', patientData.fullName)
        console.log('Registration Date:', patientData.registrationDate)
        console.log('All patient data keys:', Object.keys(patientData))
        console.log('All patient data values:', Object.values(patientData))

        // Check if we need to book an appointment for today
        if (formData.addToTodaysAppointment && response.ID) {
          console.log('=== BOOKING APPOINTMENT FOR TODAY ===')
          console.log('Add to Today\'s Appointments is enabled')
          console.log('Patient ID for appointment:', response.ID)
          console.log('Doctor ID:', currentDoctorId)
          console.log('Clinic ID:', currentClinicId)

          try {
            const now = new Date();
            const hh = String(now.getHours()).padStart(2, '0');
            const mm = String(now.getMinutes()).padStart(2, '0');
            const currentVisitTime = `${hh}:${mm}`;

            const appointmentData: AppointmentRequest = {
              visitDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
              shiftId: 1, // Default shift ID
              clinicId: currentClinicId || "CL-00001", // Use current clinic ID or default
              doctorId: currentDoctorId || "DR-00010", // Use current doctor ID or default
              patientId: response.ID, // Use the patient ID from registration response
              visitTime: currentVisitTime, // Real-time visit time (HH:mm)
              reportsReceived: false, // Default value
              inPerson: true // Default to in-person appointment
            };

            console.log('=== APPOINTMENT DATA ===')
            console.log('Appointment data:', appointmentData)

            const appointmentResult = await appointmentService.bookAppointment(appointmentData);
            console.log('=== APPOINTMENT BOOKING RESULT ===')
            console.log('Appointment booking result:', appointmentResult)

            if (appointmentResult.success) {
              console.log('=== APPOINTMENT BOOKED SUCCESSFULLY ===')
              console.log('Appointment booked for patient:', response.ID)
            } else {
              console.error('=== APPOINTMENT BOOKING FAILED ===')
              console.error('Appointment booking failed:', appointmentResult.error || 'Unknown error')
            }
          } catch (appointmentError) {
            console.error('=== ERROR BOOKING APPOINTMENT ===')
            console.error('Error booking appointment:', appointmentError)
            // Don't throw here - we still want to proceed with patient registration success
          }
        } else {
          console.log('=== SKIPPING APPOINTMENT BOOKING ===')
          console.log('Add to Today\'s Appointments:', formData.addToTodaysAppointment)
          console.log('Patient ID available:', !!response.ID)
        }

        console.log('=== CALLING onSave CALLBACK ===')
        console.log('onSave function exists:', !!onSave)
        console.log('onSave function type:', typeof onSave)

        if (onSave) {
          console.log('Calling onSave with patient data...')
          onSave(patientData)
          console.log('onSave called successfully')
        } else {
          console.log('No onSave callback provided')
        }

        // Show success snackbar
        const successMessage = formData.addToTodaysAppointment
          ? 'Patient added and appointment booked successfully!'
          : 'Patient added successfully!'
        setSnackbarMessage("Saved Successfully!");
        setSnackbarOpen(true);

        console.log('=== SNACKBAR SET ===')
        console.log('Snackbar message:', successMessage)
        console.log('Snackbar open:', true)

        // Reset form immediately but keep dialog open briefly to show snackbar
        console.log('=== RESETTING FORM ===')
        resetForm()
        console.log('Form reset completed')

        // Close dialog after a short delay to allow snackbar to be visible
        setTimeout(() => {
          console.log('=== CLOSING DIALOG ===')
          onClose()
          console.log('Dialog closed')

          console.log('=== FORM SUBMISSION COMPLETED SUCCESSFULLY ===')
        }, 1000) // 1 second delay to ensure snackbar is visible
      } else {
        console.error('=== PATIENT REGISTRATION FAILED ===')
        console.error('Save Status:', response.SAVE_STATUS)
        console.error('Error:', response.error || response.message)
        throw new Error(response.error || response.message || 'Patient registration failed')
      }
    } catch (error) {
      console.error('=== ERROR DURING PATIENT REGISTRATION ===')
      console.error('Error saving patient:', error)
      console.error('Error type:', typeof error)
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')

      // Show error snackbar
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setSnackbarMessage(`Patient registration failed: ${errorMessage}`)
      setSnackbarOpen(true)
    } finally {
      console.log('=== FINALLY BLOCK ===')
      console.log('Setting loading to false')
      setLoading(false)
      console.log('Loading state updated')
    }
  }

  const resetForm = () => {
    // Reset form data
    setFormData({
      lastName: '',
      firstName: '',
      middleName: '',
      age: '',
      dateOfBirth: '',
      dobDate: null,
      field1: '',
      field2: 'Years',
      gender: '',
      area: '',
      city: '',
      patientId: '',
      maritalStatus: '',
      occupation: '',
      address: '',
      mobileNumber: '',
      email: '',
      state: 'Maharashtra',
      referredBy: '',
      referralName: '',
      referralContact: '',
      referralEmail: '',
      referralAddress: '',
      addToTodaysAppointment: true
    })
    // Clear errors
    setErrors({})
    // Clear area and city related states
    setAreaInput('')
    setCityInput('')
    setSelectedAreaCityId(null)
    setAreaOptions([])
    setCityOptions([])
    setAreaOpen(false)
    // Clear doctor referral states
    setReferralNameSearch('')
    setReferralNameOptions([])
    setSelectedDoctor(null)
    setShowReferralPopup(false)
  }

  const handleClose = () => {
    if (!loading) {
      resetForm()
      onClose()
    }
  }

  console.log('AddPatientPage render - Dialog should be:', open ? 'OPEN' : 'CLOSED');
  console.log('Snackbar state - open:', snackbarOpen, 'message:', snackbarMessage);

  return (<>
    {/* Success Snackbar (outside Dialog so it persists after close) */}
    <GlobalSnackbar
      show={snackbarOpen}
      message={snackbarMessage}
      onClose={() => {
        console.log('Snackbar onClose called');
        setSnackbarOpen(false);
      }}
      autoHideDuration={5000}
    />

    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xl"
      fullWidth
      disableEscapeKeyDown={false}
      PaperProps={{
        sx: {
          borderRadius: '12px',
          maxHeight: '98vh',
          minHeight: '60vh',
          width: '90vw',
          zIndex: 11000
        }
      }}
      sx={{
        zIndex: 11000
      }}
      BackdropProps={{
        sx: {
          zIndex: 10999,
          // Disable backdrop pointer events when referral popup is open
          pointerEvents: showReferralPopup ? 'none' : 'auto'
        }
      }}
      // Disable Dialog's focus trap when referral popup is open to allow interactions
      disableEnforceFocus={showReferralPopup}
      disableAutoFocus={showReferralPopup}
    >
      <DialogTitle sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
        borderBottom: 'none',
        padding: '10px 20px 2px 20px'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', m: 0 }}>
            Patient Details
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          disabled={loading}
          disableRipple
          sx={{
            color: '#fff',
            backgroundColor: '#1976d2',
            '&:hover': { backgroundColor: '#1565c0' },
            width: 36,
            height: 36,
            borderRadius: '8px'
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{
        p: '4px 20px 8px',
        '& .MuiTextField-root, & .MuiFormControl-root': { width: '100%' },
        // Remove right padding on last column so fields align with actions
        '& .MuiGrid-container > .MuiGrid-item:last-child': { paddingRight: 0 },
        // Match Appointment page input/select height (38px)
        '& .MuiTextField-root .MuiOutlinedInput-root, & .MuiFormControl-root .MuiOutlinedInput-root': { height: 38 },
        // Typography and padding to match Appointment inputs
        '& .MuiInputBase-input, & .MuiSelect-select': {
          fontFamily: "'Roboto', sans-serif",
          fontWeight: 500,
          padding: '6px 12px',
          lineHeight: 1.5
        },
        // Outline thickness and colors (normal and focused)
        '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
          borderWidth: '2px',
          borderColor: '#B7B7B7',
          borderRadius: '8px'
        },
        '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: '#999',
          borderRadius: '8px'
        },
        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderWidth: '2px',
          borderColor: '#1E88E5',
          borderRadius: '8px'
        },
        // Add border radius to all input elements
        '& .MuiOutlinedInput-root': {
          borderRadius: '8px',
          boxShadow: 'none'
        },
        '& .MuiOutlinedInput-root.Mui-focused': { boxShadow: 'none !important' },
        // Disabled look similar to Appointment header select
        '& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-input, & .MuiOutlinedInput-root.Mui-disabled .MuiSelect-select': {
          backgroundColor: '#ECEFF1',
          WebkitTextFillColor: 'inherit'
        },
        // Autocomplete styling to match other inputs and remove inner borders
        '& .MuiAutocomplete-root .MuiAutocomplete-input': {
          opacity: 1,
          border: 'none !important',
          outline: 'none !important'
        },
        '& .MuiAutocomplete-root .MuiOutlinedInput-root': {
          height: 38,
          borderRadius: '8px',
          boxShadow: 'none',
          padding: '0 !important'
        },
        '& .MuiAutocomplete-root .MuiOutlinedInput-root .MuiOutlinedInput-input': {
          border: 'none !important',
          outline: 'none !important',
          padding: '6px 12px !important'
        },
        '& .MuiAutocomplete-root .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
          borderWidth: '2px',
          borderColor: '#B7B7B7',
          borderRadius: '8px'
        },
        '& .MuiAutocomplete-root .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: '#999',
          borderRadius: '8px'
        },
        '& .MuiAutocomplete-root .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderWidth: '2px',
          borderColor: '#1E88E5',
          borderRadius: '8px'
        },
        '& .MuiAutocomplete-root .MuiOutlinedInput-root.Mui-focused': {
          boxShadow: 'none !important'
        },
        '& .MuiAutocomplete-root .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-input': {
          border: 'none !important',
          outline: 'none !important'
        },
        // Ensure no double borders on Autocomplete input elements
        '& .MuiAutocomplete-root input': {
          border: 'none !important',
          outline: 'none !important',
          boxShadow: 'none !important'
        },
        '& .MuiAutocomplete-root .MuiTextField-root': {
          '& .MuiOutlinedInput-root .MuiOutlinedInput-input': {
            border: 'none !important',
            outline: 'none !important'
          }
        },
        // Hide loading indicator (rotating spinner) in Autocomplete
        '& .MuiAutocomplete-root .MuiCircularProgress-root': {
          display: 'none !important'
        },
        // Remove global input borders on this page only
        '& input, & textarea, & select, & .MuiTextField-root input, & .MuiFormControl-root input': {
          border: 'none !important'
        },
        '& .MuiBox-root': { mb: 0 },
        '& .MuiTypography-root': { mb: 0.25 },
        // Local override for headings inside this dialog only
        '& h1, & h2, & h3, & h4, & h5, & h6, & .MuiTypography-h1, & .MuiTypography-h2, & .MuiTypography-h3, & .MuiTypography-h4, & .MuiTypography-h5, & .MuiTypography-h6': {
          margin: '0 0 2px 0 !important'
        },
        // Consistent error message styling
        '& .MuiFormHelperText-root': {
          fontSize: '0.75rem',
          lineHeight: 1.66,
          fontFamily: "'Roboto', sans-serif",
          margin: '3px 0 0 0 !important',
          padding: '0 !important',
          minHeight: '1.25rem',
          textAlign: 'left !important'
        },
        position: 'relative'
      }}>
        {/* Loading Overlay - Shows when fetching patient data */}
        {loading && patientId && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000,
              borderRadius: '8px'
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <CircularProgress size={50} />
              <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                Loading patient data...
              </Typography>
            </Box>
          </Box>
        )}
        <Grid container spacing={3}>
          {/* Row 1: Patient ID, First Name, Middle Name, Last Name */}
          <Grid item xs={12}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                    Patient ID
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Patient ID"
                    value={formData.patientId}
                    disabled={true || readOnly}
                    sx={{
                      '& .MuiInputBase-input': {
                        backgroundColor: '#f5f5f5'
                      }
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                    First Name <span style={{ color: 'red' }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    error={!!errors.firstName}
                    helperText={errors.firstName}
                    disabled={loading || readOnly}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                    Middle Name
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Middle Name"
                    value={formData.middleName}
                    onChange={(e) => handleInputChange('middleName', e.target.value)}
                    disabled={loading || readOnly}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                    Last Name <span style={{ color: 'red' }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    error={!!errors.lastName}
                    helperText={errors.lastName}
                    disabled={loading || readOnly}
                  />
                </Box>
              </Grid>
            </Grid>
          </Grid>

          {/* Row 2: Mobile Number, Age, Gender, Area */}
          <Grid item xs={12}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                    Mobile Number
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Mobile Number(10 Digits)"
                    value={formData.mobileNumber}
                    onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                    error={!!errors.mobileNumber || (formData.mobileNumber.length > 0 && formData.mobileNumber.length !== 10)}
                    helperText={errors.mobileNumber || (formData.mobileNumber.length > 0 && formData.mobileNumber.length !== 10 ? 'Mobile number must be 10 digits' : '')}
                    disabled={loading || readOnly}
                    inputProps={{
                      maxLength: 10,
                      inputMode: 'numeric',
                      pattern: '[0-9]*'
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Box sx={{ width: '50% !important' }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                        DoB(DD-MM-YYYY) <span style={{ color: 'red' }}>*</span>
                      </Typography>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateField
                          fullWidth
                          value={formData.dobDate}
                          slotProps={{
                            textField: {
                              sx: {
                                mb: 0,
                                '& .MuiFormHelperText-root': {
                                  whiteSpace: 'nowrap'
                                }
                              },
                              error: !!errors.dateOfBirth,
                              helperText: errors.dateOfBirth
                            }
                          }}
                          onChange={(newValue: any) => {
                            // Clear error when date is selected
                            if (newValue && errors.dateOfBirth) {
                              setErrors(prev => {
                                const newErrors = { ...prev }
                                delete newErrors.dateOfBirth
                                return newErrors
                              })
                            }
                            if (newValue) {
                              const formattedDate = dayjs(newValue).format('YYYY-MM-DD')
                              const today = dayjs()
                              const dobDate = dayjs(newValue)
                              let years = today.year() - dobDate.year()
                              const m = today.month() - dobDate.month()
                              if (m < 0 || (m === 0 && today.date() < dobDate.date())) {
                                years--
                              }
                              const calculatedAge = Math.max(0, years)
                              setFormData(prev => ({
                                ...prev,
                                dobDate: newValue,
                                dateOfBirth: formattedDate,
                                age: String(calculatedAge),
                                field1: String(calculatedAge) // Update NN field with calculated age
                              }))
                            } else {
                              // When date is cleared, also clear the NN field
                              setFormData(prev => ({
                                ...prev,
                                dobDate: null,
                                dateOfBirth: '',
                                age: '',
                                field1: '' // Clear NN field when date is cleared
                              }))
                            }
                          }}
                          disabled={loading || readOnly}
                          format="DD/MM/YYYY"
                        />
                      </LocalizationProvider>
                    </Box>
                    <Box sx={{ width: '50% !important' }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                        Age (Completed)
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                        <TextField
                          sx={{ width: '55% !important', mb: 0 }}
                          placeholder="NN"
                          value={formData.field1 || ''}
                          onChange={(e) => handleInputChange('field1', e.target.value)}
                          disabled={loading || readOnly}
                        />
                        <FormControl sx={{ width: '50%' }}>
                          <Select
                            value={formData.field2 || 'Years'}
                            onChange={(e) => handleInputChange('field2', e.target.value)}
                            displayEmpty
                            disabled={loading || readOnly}
                            renderValue={(selected) => {
                              if (selected === '' || selected === null || selected === undefined) {
                                return <span style={{ color: 'rgba(0, 0, 0, 0.6)' }}>Years</span>
                              }
                              return selected
                            }}
                            sx={{
                              '& .MuiSelect-select': {
                                paddingRight: 0
                              }
                            }}
                            MenuProps={{
                              PaperProps: {
                                style: {
                                  maxHeight: 200,
                                  overflow: 'auto',
                                  zIndex: 11001
                                }
                              },
                              style: {
                                zIndex: 11001
                              }
                            }}
                          >
                            <MenuItem value="Years">Years</MenuItem>
                            <MenuItem value="Months">Months</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                    Gender <span style={{ color: 'red' }}>*</span>
                  </Typography>
                  <FormControl fullWidth error={!!errors.gender}>
                    <Select
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      disabled={loading || readOnly}
                      displayEmpty
                      renderValue={(selected) => {
                        if (selected === '' || selected === null || selected === undefined) {
                          return <span style={{ color: 'rgba(0,0,0,0.6)' }}>Select Gender</span>
                        }
                        const option = genderOptions.find(opt => opt.id === selected)
                        return option ? option.name : String(selected ?? '')
                      }}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            zIndex: 11001
                          }
                        },
                        style: {
                          zIndex: 11001
                        }
                      }}
                    >
                      {genderOptions.map(opt => (
                        <MenuItem key={opt.id} value={opt.id}>{opt.name}</MenuItem>
                      ))}
                    </Select>
                    {errors.gender && (
                      <Typography
                        component="p"
                        color="error"
                        sx={{
                          mt: 0.5,
                          ml: 0,
                          fontSize: '0.75rem !important',
                          lineHeight: 1.66,
                          fontFamily: "'Roboto', sans-serif",
                          minHeight: '1.25rem',
                          margin: '3px 0 0 0 !important',
                          fontWeight: 400
                        }}
                      >
                        {errors.gender}
                      </Typography>
                    )}
                  </FormControl>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                    Area <span style={{ color: 'red' }}>*</span>
                  </Typography>
                  <Autocomplete
                    freeSolo
                    options={areaOptions}
                    loading={areaLoading}
                    disabled={loading || readOnly}
                    getOptionKey={(opt) => {
                      if (typeof opt === 'string') return opt
                      return `${opt.id}-${opt.name}` // Use ID and name to ensure uniqueness
                    }}
                    getOptionLabel={(opt) => {
                      if (typeof opt === 'string') return opt
                      return opt.name || ''
                    }}
                    value={formData.area && areaInput === formData.area ? (areaOptions.find(o => o.name === formData.area) || null) : null}
                    inputValue={areaInput || ''}
                    onInputChange={(event, newInput, reason) => {
                      console.log('📝 Area input changed:', { newInput, reason, event: event?.type })
                      setAreaInput(newInput || '')
                      // Clear formData.area when user clears the input or when input doesn't match selected area
                      if (reason === 'clear' || !newInput) {
                        handleInputChange('area', '')
                        setAreaOpen(false)
                        setSelectedAreaCityId(null)
                        // Clear city and reset state when area is cleared
                        handleInputChange('city', '')
                        setCityInput('')
                        setCityOptions([])
                        handleInputChange('state', 'Maharashtra')
                      } else if (newInput && newInput.trim().length > 0) {
                        // If user is editing and input doesn't match the selected area, clear the selected area
                        // This prevents re-selection when backspacing
                        if (formData.area && newInput.trim() !== formData.area.trim()) {
                          handleInputChange('area', '')
                          setSelectedAreaCityId(null)
                          // Clear city and reset state when area is being edited
                          handleInputChange('city', '')
                          setCityInput('')
                          setCityOptions([])
                          handleInputChange('state', 'Maharashtra')
                        }
                        // Allow dropdown to open when user is typing
                        // The useEffect will handle opening when results arrive
                      }
                    }}
                    onChange={(event, newValue, reason) => {
                      console.log('✅ Area value changed:', { newValue, reason })
                      if (typeof newValue === 'string') {
                        handleInputChange('area', newValue)
                        setAreaInput(newValue)
                        setAreaOpen(false) // Close dropdown when value is selected
                        setSelectedAreaCityId(null) // Clear cityId for string input
                        // Clear city and reset state when area changes to string value
                        handleInputChange('city', '')
                        setCityInput('')
                        setCityOptions([])
                        handleInputChange('state', 'Maharashtra')
                      } else if (newValue) {
                        handleInputChange('area', newValue.name)
                        setAreaInput(newValue.name)
                        setAreaOpen(false) // Close dropdown when value is selected
                        // Get cityId and stateId directly from area (matching database structure)
                        const areaCityId = (newValue as any).cityId || null
                        const areaStateId = (newValue as any).stateId || null
                        setSelectedAreaCityId(areaCityId)

                        // Fetch and populate City and State based on area's cityId and stateId from database (must match exactly)
                        const fetchCityAndStateForArea = async () => {
                          try {
                            const { searchCities, getStates, getAreaDetails } = await import('../services/referenceService')
                            let matchingCity: { id: string; name: string; stateId?: string } | null = null

                            // First, try to get stateName directly from area details (this includes stateName from state_translations)
                            let stateNameFromArea: string | null = null
                            if (areaStateId) {
                              try {
                                const areaDetails = await getAreaDetails(newValue.name, 1)
                                if (areaDetails?.stateName) {
                                  stateNameFromArea = areaDetails.stateName
                                  console.log(`✅ Got stateName from area details:`, stateNameFromArea)
                                }
                              } catch (e) {
                                console.warn('Could not get area details for stateName:', e)
                              }
                            }

                            // Step 1: Fetch City using area's cityId (must match exactly)
                            if (areaCityId) {

                              // Try searching with the cityId directly first
                              try {
                                const directResults = await searchCities(areaCityId)
                                matchingCity = directResults.find(city => {
                                  const matches = city.id === areaCityId ||
                                    city.id?.toUpperCase() === areaCityId.toUpperCase() ||
                                    String(city.id) === String(areaCityId)
                                  return matches
                                }) || null
                                if (matchingCity) {
                                  console.log(`✅ Found city by direct cityId search (${areaCityId}):`, matchingCity.name)
                                }
                              } catch (e) {
                                console.warn(`Direct cityId search failed:`, e)
                              }

                              // If not found, try comprehensive search
                              if (!matchingCity) {
                                const searchTerms = ['a', 'e', 'i', 'o', 'u', 'p', 'm', 'd', 'pu', 'mu', 'de']
                                const allCitiesSet = new Set<string>()
                                const allCities: Array<{ id: string; name: string; stateId?: string }> = []

                                for (const term of searchTerms) {
                                  try {
                                    const results = await searchCities(term)
                                    results.forEach(city => {
                                      const key = `${city.id}-${city.name}`
                                      if (!allCitiesSet.has(key)) {
                                        allCitiesSet.add(key)
                                        allCities.push(city)
                                      }
                                    })
                                  } catch (e) {
                                    console.warn(`Search failed for term "${term}":`, e)
                                  }
                                }

                                matchingCity = allCities.find(city => {
                                  const matches = city.id === areaCityId ||
                                    city.id?.toUpperCase() === areaCityId.toUpperCase() ||
                                    String(city.id) === String(areaCityId)
                                  return matches
                                }) || null

                                if (matchingCity) {
                                  console.log(`✅ Found city from comprehensive search (cityId: ${areaCityId}):`, matchingCity.name)
                                }
                              }

                              if (matchingCity) {
                                // Populate city
                                handleInputChange('city', matchingCity.name)
                                setCityInput(matchingCity.name)
                              } else {
                                console.warn('⚠️ Could not find city for area cityId:', areaCityId)
                                handleInputChange('city', '')
                                setCityInput('')
                              }
                            } else {
                              handleInputChange('city', '')
                              setCityInput('')
                            }

                            // Step 2: Fetch State using area's stateId (must match exactly from database)
                            // Priority: 1) stateName from area details (state_translations.state_name), 2) from getStates, 3) fallback to city
                            if (areaStateId) {
                              try {
                                // First, use stateName from area details if available (this comes from state_translations.state_name)
                                if (stateNameFromArea) {
                                  handleInputChange('state', stateNameFromArea)
                                  console.log(`✅ Using stateName from area details (stateId: ${areaStateId}):`, stateNameFromArea)
                                } else {
                                  // Fallback: try to get from getStates
                                  const allStates = await getStates()
                                  const matchingState = allStates.find(state => {
                                    const matches = state.id === areaStateId ||
                                      state.id?.toUpperCase() === areaStateId.toUpperCase() ||
                                      String(state.id) === String(areaStateId)
                                    return matches
                                  })
                                  if (matchingState && matchingState.name && matchingState.name !== matchingState.id) {
                                    handleInputChange('state', matchingState.name)
                                    console.log(`✅ Found state from getStates (stateId: ${areaStateId}):`, matchingState.name)
                                  } else {
                                    console.warn('⚠️ Could not find state name for area stateId:', areaStateId)
                                    // Fallback: try to get state from city if available
                                    if (matchingCity?.stateId) {
                                      const cityStateId = matchingCity.stateId
                                      const cityStateMatch = allStates.find(state => {
                                        const matches = state.id === cityStateId ||
                                          state.id?.toUpperCase() === cityStateId.toUpperCase() ||
                                          String(state.id) === String(cityStateId)
                                        return matches
                                      })
                                      if (cityStateMatch && cityStateMatch.name && cityStateMatch.name !== cityStateMatch.id) {
                                        handleInputChange('state', cityStateMatch.name)
                                        console.log(`✅ Found state from city fallback (stateId: ${cityStateId}):`, cityStateMatch.name)
                                      }
                                    }
                                  }
                                }
                              } catch (e) {
                                console.error('Error fetching state for area:', e)
                              }
                            } else {
                              // Fallback: try to get state from city if area doesn't have stateId
                              if (matchingCity?.stateId) {
                                try {
                                  const allStates = await getStates()
                                  const cityStateId = matchingCity.stateId
                                  const matchingState = allStates.find(state => {
                                    const matches = state.id === cityStateId ||
                                      state.id?.toUpperCase() === cityStateId.toUpperCase() ||
                                      String(state.id) === String(cityStateId)
                                    return matches
                                  })
                                  if (matchingState && matchingState.name && matchingState.name !== matchingState.id) {
                                    handleInputChange('state', matchingState.name)
                                    console.log(`✅ Found state from city (stateId: ${cityStateId}):`, matchingState.name)
                                  }
                                } catch (e) {
                                  console.error('Error fetching state from city:', e)
                                }
                              } else {
                                handleInputChange('state', 'Maharashtra')
                              }
                            }
                          } catch (e) {
                            console.error('Error fetching city and state for area:', e)
                            handleInputChange('city', '')
                            setCityInput('')
                            handleInputChange('state', 'Maharashtra')
                          }
                        }
                        fetchCityAndStateForArea()
                        console.log('🔍 Area selected with cityId:', areaCityId, 'stateId:', areaStateId)
                      } else if (reason === 'clear') {
                        handleInputChange('area', '')
                        setAreaInput('')
                        setAreaOpen(false)
                        setSelectedAreaCityId(null) // Clear selected area cityId
                        // Clear city and state when area is cleared
                        handleInputChange('city', '')
                        setCityInput('')
                        setCityOptions([])
                        // Reset state to default when area is cleared
                        handleInputChange('state', 'Maharashtra')
                      }
                    }}
                    filterOptions={(options) => options}
                    open={areaOpen && areaOptions.length > 0 && !areaLoading}
                    onOpen={() => {
                      // Always allow opening when user clicks/focuses on the field
                      // This allows users to change the selected area
                      console.log('🔓 Area autocomplete opened, options:', areaOptions.length)
                      setAreaOpen(true)
                    }}
                    onClose={(event, reason) => {
                      console.log('🔒 Area autocomplete closed:', reason)
                      setAreaOpen(false)
                    }}
                    ListboxProps={{
                      style: {
                        maxHeight: '300px'
                      }
                    }}
                    disablePortal={false}
                    slotProps={{
                      popper: {
                        style: {
                          zIndex: 11001
                        },
                        placement: 'bottom-start',
                        modifiers: [
                          {
                            name: 'offset',
                            options: {
                              offset: [0, 4]
                            }
                          },
                          {
                            name: 'sameWidth',
                            enabled: true,
                            fn: ({ state }) => {
                              state.styles.popper.width = `${state.rects.reference.width}px`
                              return state
                            },
                            phase: 'beforeWrite',
                            requires: ['computeStyles']
                          }
                        ]
                      },
                      paper: {
                        sx: {
                          zIndex: 11001,
                          maxHeight: '300px',
                          width: 'inherit',
                          minWidth: '100%'
                        }
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        placeholder="Search Area"
                        error={!!errors.area}
                        helperText={errors.area}
                        disabled={loading || readOnly}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <InputAdornment position="end" sx={{ pr: 1 }}>
                              <Search sx={{ color: '#666' }} />
                            </InputAdornment>
                          )
                        }}
                      />
                    )}
                  />
                </Box>
              </Grid>

            </Grid>
          </Grid>

          {/* Row 3: City, State, Marital Status, Occupation */}
          <Grid item xs={12}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                    City
                  </Typography>
                  {formData.area && formData.area.trim() !== '' ? (
                    // If area is selected, show regular TextField (no dropdown)
                    <TextField
                      fullWidth
                      placeholder="City"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      disabled={loading || readOnly}
                    />
                  ) : (
                    // If no area is selected, show Autocomplete for searching
                    <Autocomplete
                      options={cityOptions}
                      popupIcon={null}
                      forcePopupIcon={false}
                      loading={cityLoading}
                      disabled={loading || readOnly}
                      getOptionLabel={(opt) => opt.name || ''}
                      value={cityOptions.find(o => o.name === formData.city) || null}
                      inputValue={cityInput}
                      onInputChange={(_, newInput, reason) => {
                        setCityInput(newInput)
                        // Clear formData.city when user clears the input
                        if (reason === 'clear' || !newInput) {
                          handleInputChange('city', '')
                        }
                      }}
                      onChange={(_, newValue) => {
                        handleInputChange('city', newValue?.name || '')
                        // Update input to show selected value
                        if (newValue) {
                          setCityInput(newValue.name)

                          // Populate state based on city's stateId
                          const cityStateId = (newValue as any).stateId
                          if (cityStateId) {
                            const fetchStateForCity = async () => {
                              try {
                                const { getStates } = await import('../services/referenceService')
                                const allStates = await getStates()
                                const matchingState = allStates.find(state => {
                                  const matches = state.id === cityStateId ||
                                    state.id?.toUpperCase() === cityStateId.toUpperCase() ||
                                    String(state.id) === String(cityStateId)
                                  return matches
                                })
                                if (matchingState) {
                                  handleInputChange('state', matchingState.name)
                                  console.log(`✅ Found state from manually selected city (stateId: ${cityStateId}):`, matchingState.name)
                                } else {
                                  console.warn('⚠️ Could not find state for city stateId:', cityStateId)
                                }
                              } catch (e) {
                                console.error('Error fetching state for manually selected city:', e)
                              }
                            }
                            fetchStateForCity()
                          } else {
                            console.warn('⚠️ Selected city does not have stateId')
                          }
                        } else {
                          // Clear state when city is cleared
                          handleInputChange('state', 'Maharashtra')
                        }
                      }}
                      filterOptions={(options) => options}
                      disablePortal={false}
                      slotProps={{
                        popper: {
                          style: {
                            zIndex: 11001
                          },
                          placement: 'bottom-start',
                          modifiers: [
                            {
                              name: 'offset',
                              options: {
                                offset: [0, 4]
                              }
                            },
                            {
                              name: 'sameWidth',
                              enabled: true,
                              fn: ({ state }) => {
                                state.styles.popper.width = `${state.rects.reference.width}px`
                                return state
                              },
                              phase: 'beforeWrite',
                              requires: ['computeStyles']
                            }
                          ]
                        },
                        paper: {
                          sx: {
                            zIndex: 11001,
                            maxHeight: '300px',
                            width: 'inherit',
                            minWidth: '100%'
                          }
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          placeholder="Search City"
                          disabled={loading || readOnly}
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <InputAdornment position="end" sx={{ pr: 1 }}>
                                <Search sx={{ color: '#666' }} />
                              </InputAdornment>
                            )
                          }}
                        />
                      )}
                    />
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                    State
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="State"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    disabled={loading || readOnly}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                    Marital Status
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      value={formData.maritalStatus}
                      onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
                      disabled={loading || readOnly}
                      displayEmpty
                      renderValue={(selected) => {
                        if (selected === '' || selected === null || selected === undefined) {
                          return <span style={{ color: 'rgba(0,0,0,0.6)' }}>Select Marital Status</span>
                        }
                        const option = maritalStatusOptions.find(opt => opt.id === selected)
                        return option ? option.name : String(selected ?? '')
                      }}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            zIndex: 11001
                          }
                        },
                        style: {
                          zIndex: 11001
                        }
                      }}
                    >
                      {maritalStatusOptions.map(opt => (
                        <MenuItem key={opt.id} value={opt.id}>{opt.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                    Occupation
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      value={formData.occupation}
                      onChange={(e) => handleInputChange('occupation', e.target.value)}
                      disabled={loading || readOnly}
                      displayEmpty
                      renderValue={(selected) => {
                        if (selected === '' || selected === null || selected === undefined) {
                          return <span style={{ color: 'rgba(0,0,0,0.6)' }}>Select Occupation</span>
                        }
                        const option = occupationOptions.find(opt => opt.id === selected)
                        return option ? option.name : String(selected ?? '')
                      }}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            zIndex: 11001
                          }
                        },
                        style: {
                          zIndex: 11001
                        }
                      }}
                    >
                      {occupationOptions.map(opt => (
                        <MenuItem key={opt.id} value={opt.id}>{opt.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Grid>
            </Grid>
          </Grid>

          {/* Row 4: Address, E-Mail ID, Referred By, Referral Name */}
          <Grid item xs={12}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                    Address
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    disabled={loading || readOnly}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                    E-Mail ID
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="E-Mail ID - preferably facebook / gm"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    error={!!errors.email}
                    helperText={errors.email}
                    disabled={loading || readOnly}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                    Referred By
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      value={formData.referredBy}
                      onChange={(e) => handleInputChange('referredBy', e.target.value)}
                      disabled={loading || readOnly}
                      displayEmpty
                      renderValue={(selected) => {
                        if (selected === '' || selected === null || selected === undefined) {
                          return <span style={{ color: 'rgba(0,0,0,0.6)' }}>Referred By</span>
                        }
                        const option = referByOptions.find(opt => opt.id === selected)
                        return option ? option.name : String(selected ?? '')
                      }}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            zIndex: 11001
                          }
                        },
                        style: {
                          zIndex: 11001
                        }
                      }}
                    >
                      {/** Dynamically render from API-loaded options */}
                      {referByOptions.map(opt => (
                        <MenuItem key={opt.id} value={opt.id}>{opt.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                    Referral Name
                  </Typography>
                  {isDoctorReferral() ? (
                    // Show regular text field if referral name exists (data was patched/loaded)
                    // Show search field with add button only if no referral name exists yet
                    (formData.referralName && formData.referralName.trim() !== '') || selectedDoctor !== null ? (
                      <TextField
                        fullWidth
                        placeholder="Referral Name"
                        value={formData.referralName}
                        onChange={(e) => handleInputChange('referralName', e.target.value)}
                        disabled={loading || readOnly || selectedDoctor !== null}
                        sx={{
                          '& .MuiInputBase-input': {
                            backgroundColor: selectedDoctor !== null ? '#f5f5f5' : 'white',
                            cursor: selectedDoctor !== null ? 'not-allowed' : 'text'
                          }
                        }}
                      />
                    ) : (
                      <Box sx={{ position: 'relative' }}>
                        <TextField
                          fullWidth
                          placeholder="Search Doctor Name"
                          value={referralNameSearch}
                          onChange={(e) => handleReferralNameSearch(e.target.value)}
                          disabled={loading || readOnly}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  size="small"
                                  onClick={() => setShowReferralPopup(true)}
                                  sx={{
                                    backgroundColor: '#1976d2',
                                    color: 'white',
                                    '&:hover': { backgroundColor: '#1565c0' },
                                    width: 24,
                                    height: 24,
                                    borderRadius: '3px'
                                  }}
                                >
                                  <Add fontSize="small" />
                                </IconButton>
                              </InputAdornment>
                            )
                          }}
                        />

                        {/* Search Results Dropdown */}
                        {referralNameOptions.length > 0 && (
                          <Box sx={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            backgroundColor: 'white',
                            border: '1px solid #B7B7B7',
                            borderRadius: '6px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            zIndex: 11001,
                            maxHeight: '200px',
                            overflowY: 'auto'
                          }}>
                            {referralNameOptions.map((option) => (
                              <Box
                                key={option.id}
                                onClick={() => {
                                  // Store the selected doctor data
                                  setSelectedDoctor((option as any).fullData)

                                  // Update form data with doctor information
                                  setFormData(prev => ({
                                    ...prev,
                                    referralName: option.name,
                                    referralContact: (option as any).fullData?.doctorMob || '',
                                    referralEmail: (option as any).fullData?.doctorMail || '',
                                    referralAddress: (option as any).fullData?.doctorAddress || ''
                                  }))

                                  setReferralNameSearch(option.name)
                                  setReferralNameOptions([])

                                  console.log('=== DOCTOR SELECTED ===')
                                  console.log('Selected doctor data:', (option as any).fullData)
                                  console.log('Updated form data:', {
                                    referralName: option.name,
                                    referralContact: (option as any).fullData?.doctorMob || '',
                                    referralEmail: (option as any).fullData?.doctorMail || '',
                                    referralAddress: (option as any).fullData?.doctorAddress || ''
                                  })
                                  console.log('=== END DOCTOR SELECTED ===')
                                }}
                                sx={{
                                  padding: '8px 12px',
                                  cursor: 'pointer',
                                  fontSize: '0.9rem',
                                  borderBottom: '1px solid #f0f0f0',
                                  transition: 'background-color 0.2s',
                                  '&:hover': { backgroundColor: '#f5f5f5' }
                                }}
                              >
                                {option.name}
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Box>
                    )
                  ) : (
                    <TextField
                      fullWidth
                      placeholder="Referral Name"
                      value={formData.referralName}
                      onChange={(e) => handleInputChange('referralName', e.target.value)}
                      disabled={loading || readOnly}
                    />
                  )}
                </Box>
              </Grid>
            </Grid>
          </Grid>

          {/* Row 5: Referral Contact, Referral Email, Referral Address */}
          <Grid item xs={12}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                    Referral Contact
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Referral Number(10 Digits)"
                    value={formData.referralContact}
                    onChange={(e) => handleInputChange('referralContact', e.target.value)}
                    disabled={loading || readOnly || selectedDoctor !== null}
                    error={!!errors.referralContact || (formData.referralContact.length > 0 && formData.referralContact.length !== 10)}
                    helperText={errors.referralContact || (formData.referralContact.length > 0 && formData.referralContact.length !== 10 ? 'Referral contact must be 10 digits' : '')}
                    inputProps={{
                      maxLength: 10,
                      inputMode: 'numeric',
                      pattern: '[0-9]*'
                    }}
                    sx={{
                      '& .MuiInputBase-input': {
                        backgroundColor: selectedDoctor !== null ? '#f5f5f5' : 'white',
                        cursor: selectedDoctor !== null ? 'not-allowed' : 'text'
                      }
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                    Referral Email
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Referral Email"
                    value={formData.referralEmail}
                    onChange={(e) => handleInputChange('referralEmail', e.target.value)}
                    disabled={loading || readOnly || selectedDoctor !== null}
                    error={!!errors.referralEmail}
                    helperText={errors.referralEmail}
                    sx={{
                      '& .MuiInputBase-input': {
                        backgroundColor: selectedDoctor !== null ? '#f5f5f5' : 'white',
                        cursor: selectedDoctor !== null ? 'not-allowed' : 'text'
                      }
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                    Referral Address
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Referral Address"
                    value={formData.referralAddress}
                    onChange={(e) => handleInputChange('referralAddress', e.target.value)}
                    disabled={loading || readOnly || selectedDoctor !== null}
                    sx={{
                      '& .MuiInputBase-input': {
                        backgroundColor: selectedDoctor !== null ? '#f5f5f5' : 'white',
                        cursor: selectedDoctor !== null ? 'not-allowed' : 'text'
                      }
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', height: '100%' }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                      Add to Today’s Appointments
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.addToTodaysAppointment}
                          onChange={(e) => handleInputChange('addToTodaysAppointment', e.target.checked as any)}
                          disabled={loading || readOnly}
                          color="primary"
                        />
                      }
                      label=""
                    />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ padding: '0 20px 14px', backgroundColor: 'transparent', borderTop: 'none', justifyContent: 'flex-end' }}>
        <Box sx={{ display: 'flex', gap: 1, bgcolor: 'transparent', boxShadow: 'none', borderRadius: 0, p: 0 }}>
          <Button
            onClick={resetForm}
            variant="contained"
            disabled={loading || readOnly}
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': { backgroundColor: '#1565c0' }
            }}
          >
            Reset
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={loading || readOnly}
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': { backgroundColor: '#1565c0' }
            }}
          >
            Submit
          </Button>
        </Box>
      </DialogActions>
    </Dialog>

    {/* Add New Referral Popup */}
    <AddReferralPopup
      open={showReferralPopup}
      onClose={() => setShowReferralPopup(false)}
      onSave={(referralData: ReferralData) => {
        // Handle save new referral logic here
        console.log('New referral data:', referralData)
        // Refresh referral name options after saving
        if (isDoctorReferral()) {
          handleReferralNameSearch(referralData.doctorName || '')
        }
      }}
      clinicId={currentClinicId}
    />
  </>)
}
