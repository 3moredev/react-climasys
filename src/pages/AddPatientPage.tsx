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
  Switch
} from '@mui/material'
import Autocomplete from '@mui/material/Autocomplete'
import { Close, Save, Person, Search, CalendarToday } from '@mui/icons-material'
import { patientService, QuickRegistrationRequest } from '../services/patientService'

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
  const dobInputRef = useRef<HTMLInputElement>(null)
  
  // Store doctorId and clinicId from props
  const [currentDoctorId, setCurrentDoctorId] = useState<string>('')
  const [currentClinicId, setCurrentClinicId] = useState<string>('')

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
      regYear: new Date().getFullYear().toString(),
      // familyFolder: formData.familyFolder || '',
      registrationStatus: 'P', // Default to 'P' for Pending
      userId: 'Recep2', // You might want to get this from session
      referBy: selectedReferBy ? selectedReferBy.id : formData.referredBy,
      referDoctorDetails: formData.referralName ? 
        `${formData.referralName}${formData.referralContact ? ` - ${formData.referralContact}` : ''}${formData.referralEmail ? ` (${formData.referralEmail})` : ''}` : '',
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
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
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
      
      if (response.success) {
        console.log('=== PATIENT REGISTRATION SUCCESSFUL ===')
        console.log('Patient ID:', response.patientId)
        console.log('Rows Affected:', response.rowsAffected)
        console.log('Message:', response.message)
        
        // Create patient data for callback
        const patientData = {
          ...formData,
          patientId: response.patientId || `PAT-${Date.now().toString().slice(-6)}`,
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
      } else {
        console.error('=== PATIENT REGISTRATION FAILED ===')
        console.error('Error:', response.error)
        throw new Error(response.error || 'Patient registration failed')
      }
      
      console.log('=== RESETTING FORM ===')
      // Reset form
      setFormData({
        lastName: '',
        firstName: '',
        middleName: '',
        age: '',
        dateOfBirth: '',
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
      console.log('Form reset completed')
      
      console.log('=== CLOSING DIALOG ===')
      onClose()
      console.log('Dialog closed')
      
      console.log('=== FORM SUBMISSION COMPLETED SUCCESSFULLY ===')
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

  return (
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
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2', m: 0 }}>
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
        '& .MuiTextField-root .MuiOutlinedInput-root, & .MuiFormControl-root .MuiOutlinedInput-root': { height: 40 },
        // Remove extra global border applied to inputs inside TextField
        '& .MuiTextField-root input': { border: 'none !important', boxShadow: 'none !important', outline: 'none', backgroundColor: 'transparent' },
        '& .MuiTextField-root input:focus': { border: 'none !important', boxShadow: 'none !important', outline: 'none', backgroundColor: 'transparent' },
        '& .MuiOutlinedInput-root.Mui-focused': { boxShadow: 'none !important ' },
        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { boxShadow: 'none' },
        '& .MuiBox-root': { mb: 0.75 },
        '& .MuiTypography-root': { mb: 0.25 }
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
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                    Age(Yrs) <span style={{ color: 'red' }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Enter Age"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value.replace(/[^0-9]/g, ''))}
                    error={!!errors.age}
                    helperText={errors.age}
                    disabled={loading}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Box 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              cursor: 'pointer',
                              padding: '4px'
                            }}
                            onClick={() => dobInputRef.current?.showPicker?.() || dobInputRef.current?.click()}
                          >
                            <CalendarToday fontSize="small" sx={{ color: '#666' }} />
                          </Box>
                        </InputAdornment>
                      )
                    }}
                  />
                  {/* Hidden date input to calculate age */}
                  <input
                    ref={dobInputRef}
                    type="date"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const dob = new Date(e.target.value)
                      if (!isNaN(dob.getTime())) {
                        const today = new Date()
                        let years = today.getFullYear() - dob.getFullYear()
                        const m = today.getMonth() - dob.getMonth()
                        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                          years--
                        }
                        handleInputChange('age', String(Math.max(0, years)))
                        handleInputChange('dateOfBirth', e.target.value)
                      }
                    }}
                  />
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
                    >
                      <MenuItem value="">--Select--</MenuItem>
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
                        error={!!errors.area}
                        helperText={errors.area}
                        disabled={loading}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <InputAdornment position="end">
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
                        disabled={loading}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <InputAdornment position="end">
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
                    >
                      <MenuItem value="">--Select--</MenuItem>
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
                    >
                      <MenuItem value="">--Select--</MenuItem>
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
                    >
                      <MenuItem value="">--Select--</MenuItem>
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
                  <TextField
                    fullWidth
                    placeholder="Referral Name"
                    value={formData.referralName}
                    onChange={(e) => handleInputChange('referralName', e.target.value)}
                    disabled={loading}
                  />
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
                    disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
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
  )
}
