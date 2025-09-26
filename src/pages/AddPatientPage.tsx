import React, { useState, useRef } from 'react'
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
import { Close, Save, Person, Search, CalendarToday } from '@mui/icons-material'

interface AddPatientPageProps {
  open: boolean
  onClose: () => void
  onSave?: (patientData: any) => void
}

export default function AddPatientPage({ open, onClose, onSave }: AddPatientPageProps) {
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
  const dobInputRef = useRef<HTMLInputElement>(null)

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
    if (!validateForm()) return

    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Generate patient ID
      const patientId = `PAT-${Date.now().toString().slice(-6)}`
      
      const patientData = {
        ...formData,
        patientId,
        fullName: `${formData.firstName} ${formData.lastName}`,
        registrationDate: new Date().toISOString().split('T')[0]
      }

      if (onSave) {
        onSave(patientData)
      }
      
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
      
      onClose()
    } catch (error) {
      console.error('Error saving patient:', error)
    } finally {
      setLoading(false)
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
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
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
                  <TextField
                    fullWidth
                    value={formData.area}
                    onChange={(e) => handleInputChange('area', e.target.value)}
                    error={!!errors.area}
                    helperText={errors.area}
                    disabled={loading}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Search sx={{ color: '#666' }} />
                        </InputAdornment>
                      )
                    }}
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
                  <TextField
                    fullWidth
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    disabled={loading}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Search sx={{ color: '#666' }} />
                        </InputAdornment>
                      )
                    }}
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
                      <MenuItem value="Single">Single</MenuItem>
                      <MenuItem value="Married">Married</MenuItem>
                      <MenuItem value="Divorced">Divorced</MenuItem>
                      <MenuItem value="Widowed">Widowed</MenuItem>
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
                      <MenuItem value="Student">Student</MenuItem>
                      <MenuItem value="Employee">Employee</MenuItem>
                      <MenuItem value="Business">Business</MenuItem>
                      <MenuItem value="Retired">Retired</MenuItem>
                      <MenuItem value="Unemployed">Unemployed</MenuItem>
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
                    >
                      <MenuItem value="Self">Self</MenuItem>
                      <MenuItem value="Doctor">Doctor</MenuItem>
                      <MenuItem value="Friend">Friend</MenuItem>
                      <MenuItem value="Family">Family</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
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
