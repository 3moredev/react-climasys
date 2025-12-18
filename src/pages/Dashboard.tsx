import React, { useEffect, useState } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  CircularProgress,
  Button,
  Avatar,
  Alert,
} from '@mui/material'
import {
  People,
  CalendarToday,
  LocalPharmacy,
  Refresh,
  PersonAdd,
  Assessment,
  Schedule,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import { dashboardService, DashboardStats } from '../services/dashboardService'



const mockStats: DashboardStats = {
  totalPatients: 23250,
  todaysAppointments: 23,
  pendingLabTests: 8,
  pendingPrescriptions: 12,
  todaysRevenue: 15420,
  monthlyRevenue: 234500,
  revenueGrowth: 12.5,
  patientQueue: 8,
  emergencyCases: 2,
  dailyCollection: 45000,
  outstandingPayments: 125000,
  staffOnDuty: 12,
  averageConsultationTime: 15,
  noShowRate: 8.5,
  patientSatisfaction: 4.6,
  // Legacy dashboard values
  newPatientsLast30Days: 0,
  malePatients: 11540,
  femalePatients: 11710,
  totalPatientVisits: 16184,
  patientsPerDay: 22,
  totalPrescriptions: 86782,
  installationDate: "04-Jun-2019",
  licenseExpiryDate: "31-Mar-2026",
}


export default function Dashboard() {
  const { user } = useSelector((state: RootState) => state.auth)
  const [stats, setStats] = useState<DashboardStats>(mockStats)
  const [loadingStats, setLoadingStats] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Load dashboard stats
    loadDashboardStats()
  }, [user])

  const handleRefresh = () => {
    loadDashboardStats()
  }

  const handleExit = () => {
    // Handle exit/logout functionality
    console.log('Exit/Logout clicked')
    // You can add logout logic here
  }

  const handleProceed = () => {
    // Handle proceed functionality
    console.log('Proceed clicked')
    // You can add navigation logic here
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const loadDashboardStats = async () => {
    setLoadingStats(true)
    setError(null)
    try {
      // Fetch dashboard data using the service
      const dashboardData = await dashboardService.getDashboardStats({
        clinicId: user?.clinicId,
        doctorId: user?.userId,
        date: new Date().toISOString().split('T')[0],
      })
      
      setStats(dashboardData)
      console.log('Dashboard data loaded successfully:', dashboardData)
    } catch (error: any) {
      console.error('Failed to load dashboard stats:', error)
      
      // Provide more specific error messages
      if (error.message?.includes('Network Error') || error.code === 'ECONNREFUSED') {
        setError('Backend server is not running. Please start the Spring Boot server.')
      } else if (error.response?.status === 404) {
        setError('Dashboard API endpoint not found. Please check backend configuration.')
      } else if (error.response?.status === 500) {
        setError('Backend server error. Using cached data.')
      } else {
        setError('Failed to load dashboard data. Using cached data.')
      }
      
      // Keep existing stats (mock data) if API fails
      console.log('Using fallback data due to API error')
    } finally {
      setLoadingStats(false)
    }
  }

  const StatCard = ({ title, value, icon, color, trend, subtitle, colorClass }: {
    title: string
    value: number | string
    icon: React.ReactNode
    color: string
    trend?: number
    subtitle?: string
    colorClass?: string
  }) => (
    <Card className={`stat-card ${colorClass || ''}`}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6" className="stat-card-title">
              {title}
            </Typography>
            <Typography variant="h3" component="h2" className="stat-card-value">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" className="stat-card-subtitle">
                {subtitle}
              </Typography>
            )}
            {trend !== undefined && (
              <Box display="flex" alignItems="center" mt={1}>
                {trend > 0 ? (
                  <TrendingUp fontSize="small" />
                ) : (
                  <TrendingDown fontSize="small" />
                )}
                <Typography variant="body2" sx={{ ml: 0.5, opacity: 0.9 }}>
                  {Math.abs(trend)}%
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar className="stat-card-icon">
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  )


  return (
    <Box className="dashboard-container">
      {/* Header */}
      <Box className="dashboard-header">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography 
              variant="h4" 
              component="h1" 
              className="dashboard-title"
              sx={{ color: 'white !important' }}
            >
              Doctor's Dashboard
            </Typography>
        <Typography 
          variant="subtitle1" 
          className="dashboard-subtitle"
          sx={{ color: 'white !important' }}
        >
          Welcome back, {stats?.doctorName || user?.doctorName || user?.firstName || 'Dr. User'} • {formatDate(new Date())}
        </Typography>
        {(stats?.clinicName || user?.clinicName) && (
          <Typography 
            variant="body2" 
            className="dashboard-subtitle" 
            sx={{ opacity: 0.8, mt: 0.5, color: 'white !important' }}
          >
            {stats?.clinicName || user?.clinicName} • {user?.roleName}
          </Typography>
        )}
          </Box>
          <IconButton 
            onClick={handleRefresh} 
            disabled={loadingStats}
            sx={{ 
              color: 'white',
              backgroundColor: 'rgba(255,255,255,0.1)',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
            }}
          >
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {loadingStats && (
        <Box display="flex" justifyContent="center" mb={2}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}


      {/* Legacy Dashboard Stats - Row 1 */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Patients"
            value={stats.totalPatients}
            icon={<People />}
            color="#3a6f9f"
            subtitle="Registered patients"
            colorClass="blue"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="New Patients (30 days)"
            value={stats.newPatientsLast30Days}
            icon={<PersonAdd />}
            color="#388e3c"
            subtitle="Last 30 days"
            colorClass="green"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Male - Female"
            value={`${stats.malePatients} - ${stats.femalePatients}`}
            icon={<People />}
            color="#9c27b0"
            subtitle="Gender distribution"
            colorClass="purple"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Installation Date"
            value={stats.installationDate}
            icon={<Assessment />}
            color="#5d4037"
            subtitle="Since 2019"
            colorClass="brown"
          />
        </Grid>
      </Grid>

      {/* Legacy Dashboard Stats - Row 2 */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Patient Visits"
            value={stats.totalPatientVisits}
            icon={<CalendarToday />}
            color="#3a6f9f"
            subtitle="Total visits"
            colorClass="blue"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Patients / Day"
            value={stats.patientsPerDay}
            icon={<Schedule />}
            color="#388e3c"
            subtitle="Daily average"
            colorClass="green"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Prescriptions"
            value={stats.totalPrescriptions}
            icon={<LocalPharmacy />}
            color="#f57c00"
            subtitle="All time"
            colorClass="orange"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="License Expiry"
            value={stats.licenseExpiryDate}
            icon={<Assessment />}
            color="#d32f2f"
            subtitle="System license"
            colorClass="red"
          />
        </Grid>
      </Grid>


      {/* Action Buttons Row */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={4}>
          <Box display="flex" justifyContent="center">
            <Button
              variant="contained"
              color="primary"
              size="large"
              className="form-button"
              sx={{ height: '38px', minWidth: '190px' }}
              onClick={handleExit}
            >
              Exit / Logout
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Box display="flex" justifyContent="center">
            <Button
              variant="contained"
              color="primary"
              size="large"
              className="form-button"
              sx={{ height: '38px', minWidth: '190px' }}
              onClick={handleProceed}
            >
              Proceed
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} sm={4}>
          {/* Empty space for layout balance */}
        </Grid>
      </Grid>
      
    </Box>
  )
}
