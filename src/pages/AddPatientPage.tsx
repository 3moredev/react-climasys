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
  Snackbar
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

interface AddPatientPageProps {
  open: boolean
  onClose: () => void
  onSave?: (patientData: any) => void
  doctorId?: string
  clinicId?: string
}

export default function AddPatientPage({ open, onClose, onSave, doctorId, clinicId }: AddPatientPageProps) {
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    middleName: '',
    age: '',
    dateOfBirth: '',
    dobDate: null as Date | null,
    field1: '',
    field2: 'Years',
    gender: '',
    area: 'pune',
    city: 'Pune',
    patientId: '',
    maritalStatus: '',
    occupation: '',
    address: '',
    mobileNumber: '',
    email: '',
    state: 'Maharashtra',
    referredBy: 'Self',
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
  const [areaOptions, setAreaOptions] = useState<{ id: string; name: string }[]>([])
  const [areaInput, setAreaInput] = useState('')
  const [areaLoading, setAreaLoading] = useState(false)
  const [cityOptions, setCityOptions] = useState<{ id: string; name: string }[]>([])
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

  // Function to map form data to API request format
  const mapFormDataToApiRequest = (): QuickRegistrationRequest => {
    // Get the selected area, city, gender, marital status, and occupation objects
    const selectedArea = areaOptions.find(opt => opt.name === formData.area)
    const selectedCity = cityOptions.find(opt => opt.name === formData.city)
    const selectedGender = genderOptions.find(opt => opt.id === formData.gender)
    const selectedMaritalStatus = maritalStatusOptions.find(opt => opt.id === formData.maritalStatus)
    const selectedOccupation = occupationOptions.find(opt => opt.id === formData.occupation)
    const selectedReferBy = referByOptions.find(opt => opt.id === formData.referredBy)

    console.log('=== MAPPING FORM DATA TO API REQUEST ===')
    console.log('Selected Area:', selectedArea)
    console.log('Selected City:', selectedCity)
    console.log('Selected Gender:', selectedGender)
    console.log('Selected Marital Status:', selectedMaritalStatus)
    console.log('Selected Occupation:', selectedOccupation)
    console.log('Selected Refer By:', selectedReferBy)

    const apiRequest: QuickRegistrationRequest = {
      doctorId: currentDoctorId,
      lastName: formData.lastName,
      middleName: formData.middleName || '',
      firstName: formData.firstName,
      mobile: formData.mobileNumber,
      areaId: selectedArea ? parseInt(selectedArea.id) : undefined,
      cityId: selectedCity ? selectedCity.id : 'PU', // Default to 'PU' for Pune
      stateId: 'MAH', // Default to Maharashtra
      countryId: 'IND', // Default to India
      dob: formData.dateOfBirth || undefined,
      age: formData.age || undefined,
      gender: selectedGender ? selectedGender.id : formData.gender,
      regYear: '5', // Match Swagger format
      registrationStatus: 'P', // Default to 'P' for Pending
      userId: 'Recep2', // You might want to get this from session
      referBy: selectedReferBy ? selectedReferBy.id : '',
      referDoctorDetails: '',
      maritalStatus: selectedMaritalStatus ? selectedMaritalStatus.id : '',
      occupation: selectedOccupation ? parseInt(selectedOccupation.id) : undefined,
      address: formData.address || '',
      patientEmail: formData.email || '',
      doctorAddress: '',
      doctorMobile: formData.mobileNumber, // Use patient's mobile as doctor mobile
      doctorEmail: '',
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

  useEffect(() => {
    let active = true
    const fetchAreas = async () => {
      try {
        setAreaLoading(true)
        const { searchAreas } = await import('../services/referenceService')
        const results = await searchAreas(areaInput)
        if (active) setAreaOptions(results)
      } catch (e) {
        console.error('Failed to search areas', e)
      } finally {
        if (active) setAreaLoading(false)
      }
    }

    // Debounce user input
    const handle = setTimeout(() => {
      fetchAreas()
    }, 300)

    return () => {
      active = false
      clearTimeout(handle)
    }
  }, [areaInput])

  useEffect(() => {
    let active = true
    const fetchCities = async () => {
      try {
        setCityLoading(true)
        const { searchCities } = await import('../services/referenceService')
        const results = await searchCities(cityInput)
        if (active) setCityOptions(results)
      } catch (e) {
        console.error('Failed to search cities', e)
      } finally {
        if (active) setCityLoading(false)
      }
    }

    const handle = setTimeout(() => {
      fetchCities()
    }, 300)

    return () => {
      active = false
      clearTimeout(handle)
    }
  }, [cityInput])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value }
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
        setReferralNameSearch('')
        setReferralNameOptions([])
        // Clear selected doctor if not a doctor referral
        if (value !== 'D') {
          setSelectedDoctor(null)
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
    
    // Validate age
    if (!formData.age.trim()) newErrors.age = 'Age is required'
    
    // Validate mobile number format
    if (formData.mobileNumber && !/^\d{10}$/.test(formData.mobileNumber.replace(/\D/g, ''))) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number'
    }
    
    // Validate email if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
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
        setSnackbarMessage(successMessage)
        setSnackbarOpen(true)
        
        // Wait for 2 seconds to show snackbar, then close form
        setTimeout(() => {
          console.log('=== RESETTING FORM ===')
          // Reset form
          setFormData({
            lastName: '',
            firstName: '',
            middleName: '',
            age: '',
            dateOfBirth: '',
            dobDate: null,
            field1: '',
            field2: '',
            gender: '',
            area: 'pune',
            city: 'Pune',
            patientId: '',
            maritalStatus: '',
            occupation: '',
            address: '',
            mobileNumber: '',
            email: '',
            state: 'Maharashtra',
            referredBy: 'Self',
            referralName: '',
            referralContact: '',
            referralEmail: '',
            referralAddress: '',
            addToTodaysAppointment: true
          })
          // Clear doctor referral states
          setReferralNameSearch('')
          setReferralNameOptions([])
          setSelectedDoctor(null)
          setShowReferralPopup(false)
          console.log('Form reset completed')
          
          console.log('=== CLOSING DIALOG ===')
          onClose()
          console.log('Dialog closed')
          
          console.log('=== FORM SUBMISSION COMPLETED SUCCESSFULLY ===')
        }, 2000) // 2 second delay
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
      
      // Show error message to user (you might want to add a state for this)
      alert(`Patient registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      console.log('=== FINALLY BLOCK ===')
      console.log('Setting loading to false')
      setLoading(false)
      console.log('Loading state updated')
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  return (<>
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          maxHeight: '98vh',
          minHeight: '96vh',
          width: '90vw'
        }
      }}
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
            Add Patient
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
        // Remove global input borders on this page only
        '& input, & textarea, & select, & .MuiTextField-root input, & .MuiFormControl-root input': {
          border: 'none !important'
        },
        '& .MuiBox-root': { mb: 0 },
        '& .MuiTypography-root': { mb: 0.25 },
        // Local override for headings inside this dialog only
        '& h1, & h2, & h3, & h4, & h5, & h6, & .MuiTypography-h1, & .MuiTypography-h2, & .MuiTypography-h3, & .MuiTypography-h4, & .MuiTypography-h5, & .MuiTypography-h6': {
          margin: '0 0 2px 0 !important'
        }
      }}>
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
                    disabled={true}
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
                    disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
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
                    error={!!errors.mobileNumber}
                    helperText={errors.mobileNumber}
                    disabled={loading}
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
                          slotProps={{ textField: { sx: { mb: 0 } } }}
                          onChange={(newValue: any) => {
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
                          disabled={loading}
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
                          disabled={loading}
                        />
                        <FormControl sx={{ width: '50%' }}>
                          <Select
                            value={formData.field2 || 'Years'}
                            onChange={(e) => handleInputChange('field2', e.target.value)}
                            displayEmpty
                            disabled={loading}
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
                                  overflow: 'auto'
                                }
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
                      disabled={loading}
                      displayEmpty
                      renderValue={(selected) => {
                        if (selected === '' || selected === null || selected === undefined) {
                          return <span style={{ color: 'rgba(0,0,0,0.6)' }}>Select Gender</span>
                        }
                        const option = genderOptions.find(opt => opt.id === selected)
                        return option ? option.name : String(selected ?? '')
                      }}
                    >
                      {genderOptions.map(opt => (
                        <MenuItem key={opt.id} value={opt.id}>{opt.name}</MenuItem>
                      ))}
                    </Select>
                    {errors.gender && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
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
                    options={areaOptions}
                    loading={areaLoading}
                    getOptionLabel={(opt) => opt.name}
                    value={areaOptions.find(o => o.name === formData.area) || null}
                    onChange={(_, newValue) => {
                      handleInputChange('area', newValue?.name || '')
                    }}
                    onInputChange={(_, newInput) => {
                      setAreaInput(newInput)
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        placeholder="Search Area"
                        error={!!errors.area}
                        helperText={errors.area}
                        disabled={loading}
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
                  <Autocomplete
                    options={cityOptions}
                    loading={cityLoading}
                    getOptionLabel={(opt) => opt.name}
                    value={cityOptions.find(o => o.name === formData.city) || null}
                    onChange={(_, newValue) => {
                      handleInputChange('city', newValue?.name || '')
                    }}
                    onInputChange={(_, newInput) => {
                      setCityInput(newInput)
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        placeholder="Search City"
                        disabled={loading}
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
              <Grid item xs={12} md={3}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                    State
                  </Typography>
                  <TextField
                    fullWidth
                    value={formData.state}
                    disabled={true}
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
                    Marital Status
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      value={formData.maritalStatus}
                      onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
                      disabled={loading}
                      displayEmpty
                      renderValue={(selected) => {
                        if (selected === '' || selected === null || selected === undefined) {
                          return <span style={{ color: 'rgba(0,0,0,0.6)' }}>Select Marital Status</span>
                        }
                        const option = maritalStatusOptions.find(opt => opt.id === selected)
                        return option ? option.name : String(selected ?? '')
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
                      disabled={loading}
                      displayEmpty
                      renderValue={(selected) => {
                        if (selected === '' || selected === null || selected === undefined) {
                          return <span style={{ color: 'rgba(0,0,0,0.6)' }}>Select Occupation</span>
                        }
                        const option = occupationOptions.find(opt => opt.id === selected)
                        return option ? option.name : String(selected ?? '')
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
                    disabled={loading}
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
                    disabled={loading}
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
                      disabled={loading}
                      displayEmpty
                      renderValue={(selected) => {
                        if (selected === '' || selected === null || selected === undefined) {
                          return <span style={{ color: 'rgba(0,0,0,0.6)' }}>Referred By</span>
                        }
                        const option = referByOptions.find(opt => opt.id === selected)
                        return option ? option.name : String(selected ?? '')
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
                    <Box sx={{ position: 'relative' }}>
                      <TextField
                        fullWidth
                        placeholder="Search Doctor Name"
                        value={referralNameSearch}
                        onChange={(e) => handleReferralNameSearch(e.target.value)}
                        disabled={loading}
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
                          zIndex: 1000,
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
                  ) : (
                    <TextField
                      fullWidth
                      placeholder="Referral Name"
                      value={formData.referralName}
                      onChange={(e) => handleInputChange('referralName', e.target.value)}
                      disabled={loading}
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
                    disabled={loading || selectedDoctor !== null}
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
                    disabled={loading || selectedDoctor !== null}
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
                    disabled={loading || selectedDoctor !== null}
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
                          disabled={loading}
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
            onClick={() => {
              setFormData({
                lastName: '',
                firstName: '',
                middleName: '',
                age: '',
                dateOfBirth: '',
                dobDate: null,
                field1: '',
                field2: '',
                gender: '',
                area: 'pune',
                city: 'Pune',
                patientId: '',
                maritalStatus: '',
                occupation: '',
                address: '',
                mobileNumber: '',
                email: '',
                state: 'Maharashtra',
                referredBy: 'Self',
                referralName: '',
                referralContact: '',
                referralEmail: '',
                referralAddress: '',
                addToTodaysAppointment: true
              })
              setErrors({})
              // Clear doctor referral states
              setReferralNameSearch('')
              setReferralNameOptions([])
              setSelectedDoctor(null)
              setShowReferralPopup(false)
            }}
            variant="contained"
            disabled={loading}
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
            disabled={loading}
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

    {/* Success Snackbar (outside Dialog so it persists after close) */}
    <Snackbar
      open={snackbarOpen}
      autoHideDuration={2000}
      onClose={() => setSnackbarOpen(false)}
      message={snackbarMessage}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{
        '& .MuiSnackbarContent-root': {
          backgroundColor: '#4caf50',
          color: 'white',
          fontWeight: 'bold'
        }
      }}
    />

    {/* Add New Referral Popup */}
    <AddReferralPopup
      open={showReferralPopup}
      onClose={() => setShowReferralPopup(false)}
      onSave={(referralData: ReferralData) => {
        // Handle save new referral logic here
        console.log('New referral data:', referralData)
        // You can add API call to save the new referral
        // Example: await referralService.createReferral(referralData);
      }}
    />
  </>)
}
