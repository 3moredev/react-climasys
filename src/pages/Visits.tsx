import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material'
import {
  Add,
  Edit,
  Visibility,
  Person,
  CalendarToday,
  MedicalServices,
  Science,
  LocalPharmacy,
  Receipt,
  CheckCircle,
  Pending,
} from '@mui/icons-material'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import { getTodaysVisits, addToVisit, getVisitDetails, saveVisitDetails } from '../store/slices/visitSlice'
import { searchPatients } from '../store/slices/patientSlice'
import { useForm, Controller } from 'react-hook-form'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`visit-tabpanel-${index}`}
      aria-labelledby={`visit-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

interface VisitFormData {
  patientId: string
  doctorId: string
  clinicId: string
  visitDate: string
  shiftId: number
  visitType: string
  priority: string
  notes: string
}

interface ClinicalData {
  chiefComplaint: string
  historyOfPresentIllness: string
  physicalExamination: string
  vitalSigns: string
  assessment: string
  plan: string
  notes: string
  followUpDate: string
  followUpNotes: string
}

export default function Visits() {
  const dispatch = useDispatch()
  const { user } = useSelector((state: RootState) => state.auth)
  const { todaysVisits, currentVisit, loading } = useSelector((state: RootState) => state.visits)
  const { searchResults } = useSelector((state: RootState) => state.patients)
  
  const [tabValue, setTabValue] = useState(0)
  const [openDialog, setOpenDialog] = useState(false)
  const [openVisitDialog, setOpenVisitDialog] = useState(false)
  const [selectedVisit, setSelectedVisit] = useState<any>(null)
  const [activeStep, setActiveStep] = useState(0)

  const { control: visitControl, handleSubmit: handleVisitSubmit, reset: resetVisit } = useForm<VisitFormData>({
    defaultValues: {
      patientId: '',
      doctorId: user?.doctorId || '',
      clinicId: user?.clinicId || '',
      visitDate: new Date().toISOString().split('T')[0],
      shiftId: 1,
      visitType: 'consultation',
      priority: 'normal',
      notes: '',
    }
  })

  const { control: clinicalControl, handleSubmit: handleClinicalSubmit, reset: resetClinical } = useForm<ClinicalData>({
    defaultValues: {
      chiefComplaint: '',
      historyOfPresentIllness: '',
      physicalExamination: '',
      vitalSigns: '',
      assessment: '',
      plan: '',
      notes: '',
      followUpDate: '',
      followUpNotes: '',
    }
  })

  useEffect(() => {
    if (user?.clinicId && user?.doctorId) {
      dispatch(getTodaysVisits({
        doctorId: user.doctorId,
        shiftId: '1',
        clinicId: user.clinicId,
        roleId: user.roleId,
      }))
    }
  }, [dispatch, user])

  const handleAddToVisit = async (data: VisitFormData) => {
    dispatch(addToVisit(data))
    setOpenDialog(false)
    resetVisit()
    // Refresh today's visits
    if (user?.clinicId) {
      dispatch(getTodaysVisits({
        doctorId: user.userId || 'DR-00001',
        shiftId: '1',
        clinicId: user.clinicId,
        roleId: user.role,
      }))
    }
  }

  const handleViewVisit = async (visitId: string) => {
    dispatch(getVisitDetails(visitId))
    setSelectedVisit(todaysVisits.find(v => v.visitId === visitId))
    setOpenVisitDialog(true)
  }

  const handleSaveClinicalData = async (data: ClinicalData) => {
    if (selectedVisit) {
      dispatch(saveVisitDetails({
        visitId: selectedVisit.visitId,
        visitData: data
      }))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'success'
      case 'in-progress': return 'warning'
      case 'pending': return 'info'
      case 'cancelled': return 'error'
      default: return 'default'
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const steps = [
    'Patient Information',
    'Chief Complaint',
    'Physical Examination',
    'Assessment & Plan',
    'Prescriptions & Lab Tests',
    'Complete Visit'
  ]

  return (
    <Box className="page-container">
      {/* Header */}
      <Box className="page-header">
        <Box display="flex" alignItems="center" gap={2}>
          <MedicalServices sx={{ fontSize: '2rem' }} />
          <Box>
            <Typography variant="h4" component="h1" className="page-title">
              Visit Management
            </Typography>
            <Typography variant="subtitle1" className="page-subtitle">
              Manage patient visits and medical records
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Today's Visits */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Today's Visits
          </Typography>
          {loading ? (
            <Box display="flex" justifyContent="center" p={2}>
              <CircularProgress />
            </Box>
          ) : todaysVisits.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Patient</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {todaysVisits.map((visit) => (
                    <TableRow key={visit.visitId}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                            {getInitials(visit.patientName.split(' ')[0], visit.patientName.split(' ')[1] || '')}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">
                              {visit.patientName}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              ID: {visit.patientId}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{visit.visitDate}</TableCell>
                      <TableCell>{visit.visitType || 'Consultation'}</TableCell>
                      <TableCell>
                        <Chip
                          label={visit.status}
                          color={getStatusColor(visit.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => handleViewVisit(visit.visitId)}>
                          <Visibility />
                        </IconButton>
                        <IconButton size="small">
                          <Edit />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">No visits scheduled for today</Alert>
          )}
        </CardContent>
      </Card>

      {/* Add to Visit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Patient to Visit</DialogTitle>
        <form onSubmit={handleVisitSubmit(handleAddToVisit)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="patientId"
                  control={visitControl}
                  rules={{ required: 'Patient ID is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Patient ID"
                      placeholder="Search patient..."
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="visitDate"
                  control={visitControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Visit Date"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="shiftId"
                  control={visitControl}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Shift</InputLabel>
                      <Select {...field} label="Shift">
                        <MenuItem value={1}>Morning</MenuItem>
                        <MenuItem value={2}>Afternoon</MenuItem>
                        <MenuItem value={3}>Evening</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="visitType"
                  control={visitControl}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Visit Type</InputLabel>
                      <Select {...field} label="Visit Type">
                        <MenuItem value="consultation">Consultation</MenuItem>
                        <MenuItem value="follow-up">Follow-up</MenuItem>
                        <MenuItem value="emergency">Emergency</MenuItem>
                        <MenuItem value="routine">Routine Checkup</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="priority"
                  control={visitControl}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Priority</InputLabel>
                      <Select {...field} label="Priority">
                        <MenuItem value="low">Low</MenuItem>
                        <MenuItem value="normal">Normal</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                        <MenuItem value="urgent">Urgent</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="notes"
                  control={visitControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Notes"
                      multiline
                      rows={3}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Add to Visit
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Visit Details Dialog */}
      <Dialog open={openVisitDialog} onClose={() => setOpenVisitDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          Visit Details - {selectedVisit?.patientName}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
              <Tab label="Clinical Notes" />
              <Tab label="Vital Signs" />
              <Tab label="Lab Tests" />
              <Tab label="Prescriptions" />
              <Tab label="Billing" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <form onSubmit={handleClinicalSubmit(handleSaveClinicalData)}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Controller
                    name="chiefComplaint"
                    control={clinicalControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Chief Complaint"
                        multiline
                        rows={2}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="historyOfPresentIllness"
                    control={clinicalControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="History of Present Illness"
                        multiline
                        rows={3}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="physicalExamination"
                    control={clinicalControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Physical Examination"
                        multiline
                        rows={3}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="assessment"
                    control={clinicalControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Assessment"
                        multiline
                        rows={2}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="plan"
                    control={clinicalControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Treatment Plan"
                        multiline
                        rows={2}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="notes"
                    control={clinicalControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Additional Notes"
                        multiline
                        rows={2}
                      />
                    )}
                  />
                </Grid>
              </Grid>
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button type="submit" variant="contained">
                  Save Clinical Notes
                </Button>
              </Box>
            </form>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom>
              Vital Signs
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Blood Pressure" placeholder="120/80" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Heart Rate" placeholder="72 bpm" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Temperature" placeholder="98.6°F" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Respiratory Rate" placeholder="16/min" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Weight" placeholder="70 kg" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Height" placeholder="170 cm" />
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>
              Lab Tests
            </Typography>
            <Alert severity="info">
              Lab test management will be implemented here.
            </Alert>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" gutterBottom>
              Prescriptions
            </Typography>
            <Alert severity="info">
              Prescription management will be implemented here.
            </Alert>
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            <Typography variant="h6" gutterBottom>
              Billing Information
            </Typography>
            <Alert severity="info">
              Billing information will be displayed here.
            </Alert>
          </TabPanel>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenVisitDialog(false)}>Close</Button>
          <Button variant="contained" startIcon={<CheckCircle />}>
            Complete Visit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
