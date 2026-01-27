import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  InputAdornment,
  Pagination,
  Alert,
  CircularProgress,
} from '@mui/material'
import {
  Search,
  Add,
  Edit,
  Visibility,
  Person,
  Phone,
  Email,
  LocationOn,
  Close,
} from '@mui/icons-material'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import { searchPatients, getPatient, createPatient, clearSearchResults } from '../store/slices/patientSlice'
import { useForm, Controller } from 'react-hook-form'

interface PatientFormData {
  firstName: string
  lastName: string
  middleName?: string
  mobile: string
  gender: string
  age?: string
  dob?: string
  address?: string
  bloodGroup?: string
  email?: string
  maritalStatus?: string
  occupation?: string
}

export default function Patients() {
  const dispatch = useDispatch()
  const { searchResults, loading, error, totalCount } = useSelector((state: RootState) => state.patients)

  const [searchQuery, setSearchQuery] = useState('')
  const [searchStatus, setSearchStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [dialogError, setDialogError] = useState<string | null>(null)

  const { control, handleSubmit, reset, formState: { errors } } = useForm<PatientFormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      middleName: '',
      mobile: '',
      gender: 'M',
      age: '',
      dob: '',
      address: '',
      bloodGroup: '',
      email: '',
      maritalStatus: 'S',
      occupation: '',
    }
  })

  useEffect(() => {
    if (searchQuery.trim()) {
      dispatch(searchPatients({ query: searchQuery, status: searchStatus, page, size: pageSize }))
    } else {
      dispatch(clearSearchResults())
    }
  }, [dispatch, searchQuery, searchStatus, page, pageSize])

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setPage(1)
      dispatch(searchPatients({ query: searchQuery, status: searchStatus, page: 1, size: pageSize }))
    }
  }

  const handleCreatePatient = async (data: PatientFormData) => {
    const { user } = useSelector((state: RootState) => state.auth)

    if (!user?.doctorId || !user?.clinicId) {
      setDialogError('Please login to create patients')
      return
    }

    const patientData = {
      doctorId: user.doctorId,
      ...data,
      areaId: 0,
      cityId: 'OTH',
      stateId: 'OTH',
      countryId: 'IND',
      regYear: new Date().getFullYear().toString(),
      registrationStatus: 'Q',
      userId: user.loginId,
      referBy: '',
      referDoctorDetails: '',
      doctorAddress: '',
      doctorMobile: '',
      doctorEmail: '',
      clinicId: user.clinicId
    }

    try {
      setDialogError(null)
      await dispatch(createPatient(patientData)).unwrap()

      // Only close on success
      setOpenDialog(false)
      reset()
      handleSearch() // Refresh the list
    } catch (error: any) {
      // Show error and keep dialog open
      setDialogError(error.message || 'Failed to create patient. Please try again.')
    }
  }

  const handleViewPatient = async (patientId: string) => {
    dispatch(getPatient(patientId))
    setSelectedPatient(searchResults.find(p => p.patientId === patientId))
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const PatientCard = ({ patient }: { patient: any }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
            {getInitials(patient.firstName, patient.lastName)}
          </Avatar>
          <Box>
            <Typography variant="h6">
              {patient.firstName} {patient.lastName}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              ID: {patient.patientId}
            </Typography>
          </Box>
        </Box>
        <Box display="flex" alignItems="center" mb={1}>
          <Phone fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2">{patient.mobile}</Typography>
        </Box>
        {patient.email && (
          <Box display="flex" alignItems="center" mb={1}>
            <Email fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2">{patient.email}</Typography>
          </Box>
        )}
        {patient.address && (
          <Box display="flex" alignItems="center" mb={2}>
            <LocationOn fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" noWrap>
              {patient.address}
            </Typography>
          </Box>
        )}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Chip
            label={patient.gender === 'M' ? 'Male' : 'Female'}
            size="small"
            color={patient.gender === 'M' ? 'primary' : 'secondary'}
          />
          <Box>
            <IconButton size="small" onClick={() => handleViewPatient(patient.patientId)}>
              <Visibility />
            </IconButton>
            <IconButton size="small">
              <Edit />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )

  return (
    <Box className="page-container">
      {/* Header */}
      <Box className="page-header">
        <Box display="flex" alignItems="center" gap={2}>
          <Person sx={{ fontSize: '2rem' }} />
          <Box>
            <Typography variant="h4" component="h1" className="page-title">
              Patient Management
            </Typography>
            <Typography variant="subtitle1" className="page-subtitle">
              Search, view, and manage patient records
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Search and Filters */}
      <Paper className="search-filter-bar">
        <TextField
          placeholder="Search patients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
            endAdornment: searchQuery ? (
              <InputAdornment position="end">
                <IconButton onClick={() => setSearchQuery('')} edge="end" size="small">
                  <Close fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={searchStatus}
            label="Status"
            onChange={(e) => setSearchStatus(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={loading}
          className="form-button"
        >
          Search
        </Button>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
          className="form-button secondary"
        >
          Add Patient
        </Button>
      </Paper>

      {/* Results */}
      {error && (
        <Alert severity="error" className="dashboard-alert">
          {error}
        </Alert>
      )}

      {loading ? (
        <Box className="loading-container">
          <CircularProgress className="loading-spinner" />
          <Typography variant="body2" sx={{ mt: 2 }}>
            Loading patients...
          </Typography>
        </Box>
      ) : searchResults.length > 0 ? (
        <>
          <Paper className="content-card">
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" className="content-card-title">
                {totalCount} patients found
              </Typography>
            </Box>

            {viewMode === 'grid' ? (
              <Grid container spacing={3}>
                {searchResults.map((patient) => (
                  <Grid item xs={12} sm={6} md={4} key={patient.patientId}>
                    <PatientCard patient={patient} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <TableContainer className="data-table">
                <Table>
                  <TableHead className="data-table-header">
                    <TableRow>
                      <TableCell>Patient</TableCell>
                      <TableCell>Contact</TableCell>
                      <TableCell>Gender</TableCell>
                      <TableCell>Age</TableCell>
                      <TableCell>Registration Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {searchResults.map((patient) => (
                      <TableRow key={patient.patientId} className="data-table-row">
                        <TableCell className="data-table-cell">
                          <Box display="flex" alignItems="center">
                            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                              {getInitials(patient.firstName, patient.lastName)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2">
                                {patient.firstName} {patient.lastName}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                ID: {patient.patientId}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell className="data-table-cell">
                          <Box>
                            <Typography variant="body2">{patient.mobile}</Typography>
                            {patient.email && (
                              <Typography variant="caption" color="textSecondary">
                                {patient.email}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell className="data-table-cell">
                          <Chip
                            label={patient.gender === 'M' ? 'Male' : 'Female'}
                            size="small"
                            color={patient.gender === 'M' ? 'primary' : 'secondary'}
                            className="status-chip"
                          />
                        </TableCell>
                        <TableCell className="data-table-cell">{patient.age || 'N/A'}</TableCell>
                        <TableCell className="data-table-cell">{new Date(patient.registrationDate).toLocaleDateString()}</TableCell>
                        <TableCell className="data-table-cell">
                          <Button
                            size="small"
                            startIcon={<Visibility />}
                            onClick={() => handleViewPatient(patient.patientId)}
                            className="action-button"
                          >
                            View
                          </Button>
                          <Button
                            size="small"
                            startIcon={<Edit />}
                            className="action-button secondary"
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Pagination */}
            {totalCount > pageSize && (
              <Box display="flex" justifyContent="center" mt={3}>
                <Pagination
                  count={Math.ceil(totalCount / pageSize)}
                  page={page}
                  onChange={(_, newPage) => setPage(newPage)}
                  color="primary"
                />
              </Box>
            )}
          </Paper>
        </>
      ) : searchQuery ? (
        <Alert severity="info" className="dashboard-alert">
          No patients found matching your search criteria.
        </Alert>
      ) : (
        <Alert severity="info" className="dashboard-alert">
          Enter a search term to find patients.
        </Alert>
      )}

      {/* Add Patient Dialog */}
      <Dialog open={openDialog} onClose={() => { setOpenDialog(false); setDialogError(null); }} maxWidth="md" fullWidth>
        <DialogTitle>Add New Patient</DialogTitle>
        <form onSubmit={handleSubmit(handleCreatePatient)}>
          <DialogContent>
            {dialogError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {dialogError}
              </Alert>
            )}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="firstName"
                  control={control}
                  rules={{ required: 'First name is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="First Name"
                      error={!!errors.firstName}
                      helperText={errors.firstName?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="lastName"
                  control={control}
                  rules={{ required: 'Last name is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Last Name"
                      error={!!errors.lastName}
                      helperText={errors.lastName?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="middleName"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} fullWidth label="Middle Name" />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="mobile"
                  control={control}
                  rules={{ required: 'Mobile number is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Mobile Number"
                      error={!!errors.mobile}
                      helperText={errors.mobile?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Gender</InputLabel>
                      <Select {...field} label="Gender">
                        <MenuItem value="M">Male</MenuItem>
                        <MenuItem value="F">Female</MenuItem>
                        <MenuItem value="O">Other</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="age"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} fullWidth label="Age" type="number" />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="bloodGroup"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Blood Group</InputLabel>
                      <Select {...field} label="Blood Group">
                        <MenuItem value="A+">A+</MenuItem>
                        <MenuItem value="A-">A-</MenuItem>
                        <MenuItem value="B+">B+</MenuItem>
                        <MenuItem value="B-">B-</MenuItem>
                        <MenuItem value="AB+">AB+</MenuItem>
                        <MenuItem value="AB-">AB-</MenuItem>
                        <MenuItem value="O+">O+</MenuItem>
                        <MenuItem value="O-">O-</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} fullWidth label="Email" type="email" />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} fullWidth label="Address" multiline rows={2} />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setOpenDialog(false); setDialogError(null); }}>Close</Button>
            <Button type="submit" variant="contained">
              Add Patient
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}
