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
        // doctorId: user?.userId,
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
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h2>Dashboard...(Coming Soon)</h2>
    </div>
  )
}
