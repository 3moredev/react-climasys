import { useState } from 'react'
import { Box, Typography, Paper, TextField, Button, Alert, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import { PersonAdd, Person, Phone, Email, LocationOn } from '@mui/icons-material'
import { useSelector } from 'react-redux'
import { RootState } from '../store'

export default function RegistrationPage() {
  const { user } = useSelector((state: RootState) => state.auth)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [mobile, setMobile] = useState('')
  const [email, setEmail] = useState('')
  const [gender, setGender] = useState('M')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    setLoading(true)

    if (!user?.doctorId || !user?.clinicId) {
      setMessage('Please login to register patients')
      setLoading(false)
      return
    }

    try {
      const payload = {
        doctorId: user.doctorId,
        lastName,
        middleName: '',
        firstName,
        mobile,
        areaId: 0,
        cityId: 'OTH',
        stateId: 'OTH',
        countryId: 'IND',
        dob: '',
        age: '',
        gender,
        regYear: new Date().getFullYear().toString(),
        registrationStatus: 'Q',
        userId: user.loginId,
        referBy: '',
        referDoctorDetails: '',
        maritalStatus: 'S',
        occupation: 0,
        address: '',
        patientEmail: email,
        doctorAddress: '',
        doctorMobile: '',
        doctorEmail: '',
        clinicId: user.clinicId
      }

      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()

      if (data.SAVE_STATUS === 0) {
        setMessage(`Duplicate patient found. Please check existing records.`)
      } else if (data.SAVE_STATUS === 1) {
        setMessage(`Patient Registered Successfully! ID: ${data.ID}`)
      } else if (data.ErrorMessage) {
        setMessage(`Registration failed: ${data.ErrorMessage}`)
      } else {
        setMessage(`Patient Registered Successfully! ID: ${data.ID || 'OK'}`)
      }

      // Reset form
      setFirstName('')
      setLastName('')
      setMobile('')
      setEmail('')
      setGender('M')
    } catch (error) {
      setMessage('Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box className="page-container">
      {/* Header */}
      <Box className="page-header">
        <Box display="flex" alignItems="center" gap={2}>
          <PersonAdd sx={{ fontSize: '2rem' }} />
          <Box>
            <Typography variant="h4" component="h1" className="page-title">
              Patient Registration
            </Typography>
            <Typography variant="subtitle1" className="page-subtitle">
              Register new patients quickly and efficiently
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Registration Form */}
      <Paper className="form-container">
        <Typography variant="h5" className="form-title">
          <PersonAdd sx={{ mr: 1, verticalAlign: 'middle' }} />
          Quick Registration Form
        </Typography>

        <Box component="form" onSubmit={submit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                placeholder="Enter first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                InputProps={{
                  startAdornment: <Person sx={{ mr: 1, color: '#3a6f9f' }} />
                }}
                className="form-field"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                placeholder="Enter last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                InputProps={{
                  startAdornment: <Person sx={{ mr: 1, color: '#3a6f9f' }} />
                }}
                className="form-field"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mobile Number"
                placeholder="Enter mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
                type="tel"
                InputProps={{
                  startAdornment: <Phone sx={{ mr: 1, color: '#3a6f9f' }} />
                }}
                className="form-field"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email Address"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                InputProps={{
                  startAdornment: <Email sx={{ mr: 1, color: '#3a6f9f' }} />
                }}
                className="form-field"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth className="form-field">
                <InputLabel>Gender</InputLabel>
                <Select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  label="Gender"
                >
                  <MenuItem value="M">Male</MenuItem>
                  <MenuItem value="F">Female</MenuItem>
                  <MenuItem value="O">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box display="flex" gap={2} mt={3}>
            <Button
              type="button"
              variant="outlined"
              onClick={() => {
                setFirstName('')
                setLastName('')
                setMobile('')
                setEmail('')
                setGender('M')
                setMessage(null)
              }}
              className="action-button secondary"
            >
              Reset Form
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !firstName.trim() || !lastName.trim() || !mobile.trim()}
              className="form-button"
              startIcon={<PersonAdd />}
              sx={{ py: 1.5, px: 4 }}
            >
              {loading ? 'Registering...' : 'Register Patient'}
            </Button>
          </Box>
        </Box>

        {message && (
          <Alert
            severity={message.includes('Successfully') ? 'success' : 'error'}
            className="dashboard-alert"
            sx={{ mt: 2 }}
          >
            {message}
          </Alert>
        )}
      </Paper>

      {/* Registration Info */}
      <Paper className="content-card">
        <Typography variant="h6" className="content-card-title">
          Registration Information
        </Typography>
        <Box className="responsive-grid">
          <Box>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Required Fields
            </Typography>
            <Typography variant="body2">
              • First Name and Last Name are mandatory<br />
              • Mobile number is required for contact<br />
              • Patient ID will be generated automatically
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Registration Status
            </Typography>
            <Typography variant="body2">
              • New patients are registered with "Quick" status<br />
              • Full registration can be completed later<br />
              • All patients receive a unique ID
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}