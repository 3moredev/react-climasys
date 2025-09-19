import { useState, useEffect } from 'react'
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Alert, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  InputAdornment,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Divider
} from '@mui/material'
import { 
  CalendarToday, 
  Person, 
  Schedule, 
  Search, 
  Add,
  Save,
  Delete,
  Visibility,
  KeyboardArrowUp,
  Phone
} from '@mui/icons-material'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import appointmentService, { Appointment } from '../services/appointmentService'

export default function AppointmentsPage() {
  const { user } = useSelector((state: RootState) => state.auth)
  const [searchPatient, setSearchPatient] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState(user?.userId || 'DR-00001')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [viewingAppointments, setViewingAppointments] = useState(false)
  const [showTodayOnly, setShowTodayOnly] = useState(true)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  async function book() {
    setMessage(null)
    setLoading(true)
    try {
      const payload = { 
        visitDate: new Date().toISOString().slice(0,10), 
        shiftId: 1, 
        clinicId: user?.clinicId || 'CL-00001', 
        doctorId: user?.userId || 'DR-00001', 
        patientId: 'PAT-001' // This would come from a patient selection dialog
      }
      const data = await appointmentService.bookAppointment(payload)
      setMessage(`Appointment booked successfully: ${data.appointmentId}`)
    } catch (error) {
      setMessage('Error booking appointment. Please use the search functionality to find and book appointments for existing patients.')
    } finally {
      setLoading(false)
    }
  }

  // Load today's appointments on component mount
  useEffect(() => {
    loadTodaysAppointments()
  }, [selectedDoctor])

  // Handle scroll events for scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      setShowScrollTop(scrollTop > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  // Filter appointments by status
  const filterAppointmentsByStatus = (appointments: Appointment[], status: string) => {
    if (status === 'ALL') {
      return appointments
    }
    return appointments.filter(appointment => appointment.status === status)
  }

  // Update filtered appointments when appointments or status filter changes
  useEffect(() => {
    const filtered = filterAppointmentsByStatus(appointments, statusFilter)
    setFilteredAppointments(filtered)
  }, [appointments, statusFilter])

  async function loadTodaysAppointments() {
    setMessage(null)
    setLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      const appointmentsData = await appointmentService.getAppointmentsForDate(selectedDoctor, today)
      setAppointments(appointmentsData)
      setViewingAppointments(true)
      setShowTodayOnly(true)
    } catch (error) {
      setMessage('Error fetching today\'s appointments')
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  async function viewAllAppointments() {
    setMessage(null)
    setLoading(true)
    try {
      const appointmentsData = await appointmentService.getFutureAppointments(selectedDoctor)
      setAppointments(appointmentsData)
      setViewingAppointments(true)
      setShowTodayOnly(false)
    } catch (error) {
      setMessage('Error fetching appointments')
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  async function searchPatientAppointments() {
    if (!searchPatient.trim()) {
      setMessage('Please enter patient search criteria')
      return
    }
    
    setMessage(null)
    setLoading(true)
    try {
      // Use the new search functionality
      const appointmentsData = await appointmentService.searchAppointments(selectedDoctor, searchPatient)
      setAppointments(appointmentsData)
      setViewingAppointments(true)
      setShowTodayOnly(false)
    } catch (error) {
      setMessage('Error searching appointments')
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box 
      className="page-container appointments-page" 
      sx={{ 
        // Create a dedicated scrollable container
        height: '100vh !important',
        width: '100% !important',
        overflow: 'hidden !important',
        position: 'relative !important',
        display: 'flex !important',
        flexDirection: 'column !important',
        // Override parent constraints
        flex: 'none !important',
        zIndex: 10,
      }}
    >
      {/* Scrollable content container */}
      <Box 
        sx={{ 
          flex: 1,
          overflow: 'auto !important',
          overflowY: 'scroll !important',
          overflowX: 'hidden !important',
          height: '100% !important',
          // Force scrollbar to always be visible
          '&::-webkit-scrollbar': {
            width: '20px !important',
            height: '20px !important',
          },
          '&::-webkit-scrollbar-track': {
            background: '#e0e0e0 !important',
            borderRadius: '10px !important',
            border: '2px solid #bdbdbd !important',
            boxShadow: 'inset 0 0 5px rgba(0,0,0,0.1) !important',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'linear-gradient(180deg, #1976d2 0%, #1565c0 100%) !important',
            borderRadius: '10px !important',
            border: '3px solid #e0e0e0 !important',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2) !important',
            '&:hover': {
              background: 'linear-gradient(180deg, #1565c0 0%, #0d47a1 100%) !important',
              border: '3px solid #bdbdbd !important',
            },
            '&:active': {
              background: 'linear-gradient(180deg, #0d47a1 0%, #0277bd 100%) !important',
            },
          },
          '&::-webkit-scrollbar-corner': {
            background: '#e0e0e0 !important',
          },
          // Firefox scrollbar
          scrollbarWidth: 'thick !important',
          scrollbarColor: '#1976d2 #e0e0e0 !important',
          // Smooth scrolling
          scrollBehavior: 'smooth !important',
        }}
      >
        {/* Content with padding */}
        <Box sx={{ px: 1, pb: 1 }}>
          {/* Header */}
          <Box className="page-header" sx={{ minHeight: '35px !important', height: '35px !important', justifyContent: 'center', mb: 1 }}>
            <Typography variant="h6" className="page-title" sx={{ fontSize: '1.1rem' }}>
              Today's Appointments
            </Typography>
          </Box>

      {/* Message Display */}
      {message && (
        <Alert 
          severity={message.includes('Error') ? 'error' : 'success'} 
          sx={{ mb: 2 }}
          onClose={() => setMessage(null)}
        >
          {message}
        </Alert>
      )}

      {/* Search and Filter Controls */}
      <Paper className="content-card" sx={{ mb: 0.5, py: 0.25, px: 1.5 }}>
        <Grid container spacing={0.5} alignItems="center">
          {/* Patient Search */}
          <Grid item xs={12} sm={6} md={5}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search with Patient ID / Patient Name / Contact Number"
              value={searchPatient}
              onChange={(e) => setSearchPatient(e.target.value)}
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  height: '40px',
                  '& fieldset': {
                    border: '1px solid #c4c4c4'
                  },
                  '&:hover fieldset': {
                    border: '1px solid #c4c4c4'
                  },
                  '&.Mui-focused fieldset': {
                    border: '2px solid #1976d2'
                  }
                } 
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  searchPatientAppointments()
                }
              }}
            />
          </Grid>

          {/* Status Filter */}
          <Grid item xs={12} sm={3} md={2}>
            <FormControl fullWidth size="small" sx={{ 
              height: '40px',
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  border: '1px solid #c4c4c4'
                },
                '&:hover fieldset': {
                  border: '1px solid #c4c4c4'
                },
                '&.Mui-focused fieldset': {
                  border: '2px solid #1976d2'
                }
              }
            }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
                sx={{ 
                  height: '40px',
                  '& .MuiSelect-select': { 
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center'
                  }
                }}
              >
                <MenuItem value="ALL">All Status</MenuItem>
                <MenuItem value="SCHEDULED">Scheduled</MenuItem>
                <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
                <MenuItem value="NO_SHOW">No Show</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Doctor Selection */}
          <Grid item xs={12} sm={3} md={2}>
            <FormControl fullWidth size="small" sx={{ 
              height: '40px',
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  border: '1px solid #c4c4c4'
                },
                '&:hover fieldset': {
                  border: '1px solid #c4c4c4'
                },
                '&.Mui-focused fieldset': {
                  border: '2px solid #1976d2'
                }
              }
            }}>
              <InputLabel>Doctor</InputLabel>
              <Select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                label="Doctor"
                sx={{ 
                  height: '40px',
                  '& .MuiSelect-select': { 
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center'
                  }
                }}
              >
                <MenuItem value={user?.userId || 'DR-00001'}>
                  {user?.firstName || 'Dr. Test'} - Medicine
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Book and New Patient Buttons */}
          <Grid item xs={12} sm={6} md={3}>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Button
                variant="contained"
                startIcon={<Schedule />}
                onClick={book}
                disabled={loading}
                size="small"
                sx={{ 
                  minWidth: 'auto', 
                  px: 2, 
                  py: 0.5,
                  fontSize: '0.8rem',
                  height: '36px',
                  '& .MuiButton-startIcon': {
                    marginRight: '6px',
                    '& svg': {
                      fontSize: '18px'
                    }
                  }
                }}
              >
                Book
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setMessage('New Patient functionality coming soon!')}
                disabled={loading}
                size="small"
                sx={{ 
                  minWidth: 'auto', 
                  px: 2, 
                  py: 0.5,
                  fontSize: '0.8rem',
                  height: '36px',
                  '& .MuiButton-startIcon': {
                    marginRight: '6px',
                    '& svg': {
                      fontSize: '18px'
                    }
                  }
                }}
              >
                New Patient
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>


      {/* Appointments Table - Similar to original grid layout */}
      {viewingAppointments && (
        <Box sx={{ 
          // Aggressively break out of ALL parent container constraints
          position: 'relative !important',
          zIndex: 15,
          width: '100% !important',
          height: 'auto !important',
          minHeight: 'auto !important',
          maxHeight: 'none !important',
          overflow: 'visible !important',
          // Override any parent constraints
          '& *': {
            overflow: 'visible !important',
          },
        }}>
          <Paper 
            className="content-card" 
            sx={{ 
              mt: 1, 
              p: '16px !important', 
              mb: '24px !important',
              // Increase section height and spacing
              minHeight: '400px !important',
              maxHeight: 'none !important',
              height: 'auto !important',
              overflow: 'visible',
              // Override global content-card styles to allow proper display
              '&.content-card': {
                padding: '16px !important',
                marginBottom: '24px !important',
                minHeight: '400px !important',
                maxHeight: 'none !important',
                height: 'auto !important',
              },
              // Additional override for content-card class
              '&.MuiPaper-root.content-card': {
                height: 'auto !important',
                minHeight: '400px !important',
                maxHeight: 'none !important',
              }
            }}
          >
          
          {filteredAppointments.length > 0 ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 3,
              backgroundColor: '#f5f5f5',
              padding: '20px',
              borderRadius: '8px',
              '& .counter-row': {
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                justifyContent: 'flex-start',
                marginBottom: '20px'
              },
              '& .counter-card': {
                background: 'white',
                color: '#333333',
                borderRadius: '6px',
                padding: '12px',
                textAlign: 'left',
                minWidth: '200px',
                flex: '1 1 200px',
                maxWidth: '240px',
                minHeight: '200px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #e0e0e0',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }
              },
              '& .counter-number': {
                fontSize: '2.5rem',
                fontWeight: 'bold',
                margin: '8px 0',
                lineHeight: 1
              },
              '& .css-1pj00yd .counter-number': {
                fontSize: '1.5rem !important'
              },
              '& .css-xv9wth .counter-number': {
                fontSize: '1rem !important'
              },
              '& .counter-label': {
                fontSize: '1rem',
                opacity: 0.9,
                margin: 0
              }
            }}>
              {/* Individual Appointment Cards Row */}
              <Box className="counter-row">
                {filteredAppointments.slice(0, 15).map((appointment, index) => (
                  <Box 
                    key={appointment.appointmentId}
                    className="counter-card"
                    sx={{
                      background: 'white',
                      color: '#333333',
                      minWidth: '200px',
                      maxWidth: '240px',
                      padding: '6px 6px 0px 6px',
                      border: '1px solid #e0e0e0',
                      borderLeft: appointment.status === 'CONFIRMED' ? '3px solid #4caf50' :
                                  appointment.status === 'SCHEDULED' ? '3px solid #2196f3' :
                                  appointment.status === 'COMPLETED' ? '3px solid #8bc34a' :
                                  appointment.status === 'CANCELLED' ? '3px solid #f44336' :
                                  '3px solid #ff9800',
                      borderBottom: appointment.status === 'SCHEDULED' ? '6px solid #2196f3 !important' :
                                   appointment.status === 'CONFIRMED' ? '6px solid #4caf50 !important' :
                                   appointment.status === 'COMPLETED' ? '6px solid #2e7d32 !important' :
                                   appointment.status === 'CANCELLED' ? '6px solid #f44336 !important' :
                                   appointment.status === 'IN_PROGRESS' ? '6px solid #ff9800 !important' :
                                   '1px solid #e0e0e0',
                      position: 'relative'
                    }}
                  >
                    {/* Number Badge */}
                    <Box sx={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: '#1976d2',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      border: '2px solid white',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}>
                      {appointment.lastOpdVisit || '0'}
                    </Box>
                    {/* Patient Name and Time */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.25 }}>
                      <Typography variant="h2" className="counter-number" sx={{ fontSize: '1rem !important', textDecoration: 'underline', cursor: 'pointer', margin: 0 }}>
                        {appointment.patientName}
                      </Typography>
                      <Typography variant="h4" className="counter-label" sx={{ fontSize: '0.7rem', margin: 0 }}>
                        {appointment.appointmentTime}
                      </Typography>
                    </Box>
                    
                    {/* Age and Status Dropdown */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.25 }}>
                      <Typography variant="h4" className="counter-label" sx={{ fontSize: '0.7rem', margin: 0 }}>
                        {appointment.age ? `${appointment.age} years` : 'N/A'}
                      </Typography>
                      <FormControl size="small" sx={{ width: '90px', marginTop: '-4px' }}>
                        <Select
                          value={appointment.status}
                          onChange={(e) => {
                            // Handle status change
                            console.log('Status change:', e.target.value)
                          }}
                          sx={{
                            height: '24px',
                            fontSize: '0.6rem',
                            '& .MuiOutlinedInput-notchedOutline': {
                              border: '1px solid #c4c4c4'
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              border: '1px solid #1976d2'
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              border: '2px solid #1976d2'
                            },
                            '& .MuiSelect-select': {
                              color: '#333333',
                              fontSize: '0.6rem',
                              padding: '2px 6px'
                            }
                          }}
                        >
                          <MenuItem value="SCHEDULED" sx={{ fontSize: '0.6rem' }}>Scheduled</MenuItem>
                          <MenuItem value="CONFIRMED" sx={{ fontSize: '0.6rem' }}>Confirmed</MenuItem>
                          <MenuItem value="IN_PROGRESS" sx={{ fontSize: '0.6rem' }}>In Progress</MenuItem>
                          <MenuItem value="COMPLETED" sx={{ fontSize: '0.6rem' }}>Completed</MenuItem>
                          <MenuItem value="CANCELLED" sx={{ fontSize: '0.6rem' }}>Cancelled</MenuItem>
                          <MenuItem value="NO_SHOW" sx={{ fontSize: '0.6rem' }}>No Show</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                    
                    {/* Contact */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mb: 0.25 }}>
                      <Phone sx={{ fontSize: '0.7rem', color: 'green', marginTop: '2px' }} />
                      <Typography variant="h4" className="counter-label" sx={{ fontSize: '0.7rem', margin: 0 }}>
                        {appointment.mobileNumber || 'N/A'}
                      </Typography>
                    </Box>
                    
                    {/* Provider */}
                    <Typography variant="h4" className="counter-label" sx={{ fontSize: '0.7rem', mb: 0.25 }}>
                      {appointment.doctorName || 'Dr. Test'}
                    </Typography>
                    
                    
                    {/* Online Appointment Time */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0, gap: 0.5, paddingBottom: '16px' }}>
                      <Typography variant="h4" className="counter-label" sx={{ 
                        fontSize: '0.7rem', 
                        flexShrink: 0,
                        margin: 0,
                        lineHeight: 1,
                        display: 'flex',
                        alignItems: 'center',
                        marginTop: '2px'
                      }}>
                        Online:
                      </Typography>
                      <TextField
                        size="small"
                        placeholder="HH:MM"
                        defaultValue={appointment.onlineAppointmentTime || ''}
                        variant="standard"
                        sx={{
                          width: '90px',
                          marginTop: '-2px',
                          '& .MuiInput-root': {
                            height: '24px',
                            fontSize: '0.6rem',
                            '&:before': {
                              borderBottom: 'none'
                            },
                            '&:hover:not(.Mui-disabled):before': {
                              borderBottom: 'none'
                            },
                            '&:after': {
                              borderBottom: 'none'
                            }
                          },
                          '& .MuiInputBase-input': {
                            color: '#333333',
                            fontSize: '0.6rem',
                            padding: '2px 6px'
                          },
                          '& .css-nz481w-MuiInputBase-input-MuiInput-input': {
                            height: '0em !important'
                          }
                        }}
                      />
                    </Box>
                    
                    {/* Action Buttons */}
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 0.25, 
                      justifyContent: 'center', 
                      position: 'absolute',
                      bottom: '4px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      zIndex: 1
                    }}>
                      <IconButton 
                        size="small" 
                        sx={{ 
                          color: '#1976d2',
                          backgroundColor: '#f5f5f5',
                          border: '1px solid #e0e0e0',
                          '&:hover': { backgroundColor: '#e3f2fd' },
                          width: '24px',
                          height: '24px'
                        }}
                        title="Save"
                      >
                        <Save sx={{ fontSize: '0.7rem' }} />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        sx={{ 
                          color: '#d32f2f',
                          backgroundColor: '#f5f5f5',
                          border: '1px solid #e0e0e0',
                          '&:hover': { backgroundColor: '#ffebee' },
                          width: '24px',
                          height: '24px'
                        }}
                        title="Delete"
                      >
                        <Delete sx={{ fontSize: '0.7rem' }} />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="text.secondary">
                {appointments.length > 0 
                  ? `No appointments found with status "${statusFilter === 'ALL' ? 'All Status' : statusFilter}".` 
                  : 'No appointments found.'
                }
              </Typography>
            </Box>
          )}
          </Paper>
        </Box>
      )}
      
          {/* Extra space to ensure all cards are visible and force scrolling */}
          <Box sx={{ height: '200px', width: '100%' }} />
          
          {/* Force scroll test content */}
          <Box sx={{ 
            height: '1000px', 
            width: '100%', 
            background: 'linear-gradient(180deg, rgba(25, 118, 210, 0.1) 0%, rgba(25, 118, 210, 0.05) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px dashed #1976d2',
            borderRadius: '8px',
            mt: 2
          }}>
            <Typography variant="h6" color="primary" sx={{ textAlign: 'center' }}>
              📜 SCROLLBAR TEST AREA 📜<br/>
              This area is 1000px tall to force scrolling<br/>
              You should see a blue scrollbar on the right side
            </Typography>
          </Box>
        </Box>
      </Box>
      
      {/* Scrollbar visibility test - temporary indicator */}
      <Box sx={{ 
        position: 'fixed',
        top: '10px',
        right: '10px',
        backgroundColor: 'rgba(25, 118, 210, 0.9)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '4px',
        fontSize: '12px',
        zIndex: 1001,
        border: '2px solid #1976d2'
      }}>
        Scrollbar Test - Look for blue scrollbar on the right
      </Box>
      
      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Box
          sx={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 1000,
          }}
        >
          <IconButton
            onClick={scrollToTop}
            sx={{
              backgroundColor: '#3a6f9f',
              color: 'white',
              width: '56px',
              height: '56px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              '&:hover': {
                backgroundColor: '#2c5aa0',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
              },
              transition: 'all 0.3s ease-in-out',
            }}
            aria-label="Scroll to top"
          >
            <KeyboardArrowUp sx={{ fontSize: '28px' }} />
          </IconButton>
        </Box>
      )}
    </Box>
  )
}