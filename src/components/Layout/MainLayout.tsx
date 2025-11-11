import React from 'react'
import {
  AppBar,
  Box,
  CssBaseline,
  IconButton,
  ListItemIcon,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  Tabs,
  Tab,
  Tooltip,
} from '@mui/material'
import GlobalWrapper from './GlobalWrapper'
import {
  Dashboard,
  People,
  CalendarToday,
  Science,
  LocalPharmacy,
  Receipt,
  Assessment,
  Settings,
  Logout,
  AccountCircle,
  KeyboardArrowDown,
  KeyboardArrowRight,
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { logout } from '../../store/slices/authSlice'
import { useSession } from '../../store/hooks/useSession'
import { authService } from '../../services/authService'
import SessionTimeoutHandler from '../Session/SessionTimeoutHandler'
import { getSessionConfig } from '../../config/sessionConfig'
import { useActivityTracker } from '../../hooks/useActivityTracker'

interface MainLayoutProps {
  children: React.ReactNode
}

const menuItems = [
  { text: 'Dashboard', path: '/' },
  { text: 'OPD',  path: '/appointment' },
  { text: 'OPD Reports',  path: '/reports' },
  { text: 'OPD Master', path: '#' },
  { text: 'IPD', path: '#' },
  { text: 'IPD Report', path: '#' },
  { text: 'IPD Master', path: '#' },
  // { text: 'Settings', path: '/settings' },
]

type SubMenuItem = { label: string; path?: string; children?: SubMenuItem[] };

const subMenus: Record<string, Array<SubMenuItem>> = {
  'Dashboard': [
    { label: 'Dashboard', path: '/' },
  ],
  'OPD': [
    { label: "Today's Appointments", path: '/appointment' },
    { label: 'Patient - Quick Registration', path: '/registration/quick' },
    { label: 'Patient - Detailed Registration', path: '/registration?type=detailed' },
    { label: 'Patient - Print Registration Form', path: '/registration?print=1' },
    { label: 'Direct Treatment Entry', path: '/billing?context=opd-dues' },
  ],
  'OPD Reports': [
    {
      label: 'OPD – Collection', children: [
        { label: 'OPD Collection Statement', path: '/settings?t=operation-keyword' },
        { label: 'OPD-IIIC Register(Service-wise collection)', path: '/settings?t=sub-category' },
      ],
    },
    { label: 'OPD - Daily Collection', path: '/reports?type=receipts' },
    { label: 'OPD - Defaulters', path: '/reports?type=dashboard' },
    { label: 'Dashboard & Reports',  children: [
      { label: 'Area-Wise Patient Summary ', path: '/settings?t=operation-keyword' },
      { label: 'Summary Of Lab Suggested', path: '/settings?t=sub-category' },
      { label: 'Print Patient Details', path: '/settings?t=sub-category' },
      { label: 'Patient Appointment History', path: '/settings?t=sub-category' },
    ],},
    { label: 'IIIC Summary (IPD & OPD)', path: '/reports?type=dashboard' },
  ],
  'OPD Master': [
    { label: 'Treatment Master', children: [
      { label: 'Manage Complaints ', path: '/settings?t=operation-keyword' },
      { label: 'Manage Diagnosis', path: '/settings?t=sub-category' },
      { label: 'Manage Procedure', path: '/settings?t=sub-category' },
      { label: 'Manage Labs', path: '/settings?t=sub-category' },
      { label: 'Manage Medicines', path: '/settings?t=sub-category' },
    ], },
    { label: 'Prescription Master', children: [
      { label: 'Prescription Category ', path: '/settings?t=operation-keyword' },
      { label: 'Prescription Sub-Category', path: '/settings?t=sub-category' },
      { label: 'Prescription Details', path: '/settings?t=sub-category' },
    ], },
    { label: 'Billing', children: [
      { label: 'Billing Details', path: '/settings?t=operation-keyword' },
    ],},
  ],
  'IPD': [
    { label: 'Manage Admission Card', path: '/manage-admission-card' },
    { label: 'Manage Advance Collection', path: '/manage-advance-collection' },
    { label: 'Manage Discharge Card', path: '/manage-discharge-card' },
    { label: 'Manage Hospital Bill', path: '/manage-hospital-bill' },
  ],
  'IPD Report': [
    { label: 'IPD Collection Statement', path: '/settings?t=treatment' },
    { label: 'List Of Cashless Hospital Bills', path: '/settings?t=prescription' },
    { label: 'Discharge / Admission Card List', path: '/billing' },
    { label: 'Follow-up Patients After Discharge', path: '/billing' },
    { label: 'IPD IIIC Register', path: '/billing' },
  ],
  'IPD Master': [
    {
      label: 'Manage Master Data',
      children: [
        { label: 'Manage Keyword (Operation) Master', path: '/settings?t=operation-keyword' },
        { label: 'Manage Sub-Category', path: '/settings?t=sub-category' },
        { label: 'Manage Hospital Charges Master', path: '/settings?t=charges' },
        { label: 'Manage Insurance Company', path: '/settings?t=insurance' },
      ],
    },
    {
      label: 'Attach Master Data',
      children: [
        { label: 'Attach Treatment', path: '/settings?t=attach-treatment' },
        { label: 'Attach Prescription', path: '/settings?t=attach-prescription' },
      ],
    },
  ],
  // 'Settings': [
  //   { label: 'Settings', path: '/settings' },
  // ],
}

export default function MainLayout({ children }: MainLayoutProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  
  const { user } = useAppSelector((state) => state.auth)
  const { username, doctorName, clinicName, isLoading: sessionLoading, isValid: sessionValid, logout: sessionLogout, error: sessionError } = useSession()
  
  // Track user activity to maintain session persistence
  useActivityTracker()
  
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [masterEl, setMasterEl] = React.useState<null | HTMLElement>(null)
  const [tabMenu, setTabMenu] = React.useState<{ index: number; anchor: HTMLElement } | null>(null)
  const [subMenuL2, setSubMenuL2] = React.useState<{ anchor: HTMLElement | null; items: SubMenuItem[] } | null>(null)
  const [subMenuL3, setSubMenuL3] = React.useState<{ anchor: HTMLElement | null; items: SubMenuItem[] } | null>(null)
  const [now, setNow] = React.useState<Date>(new Date())
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)
  const [showSessionWarning, setShowSessionWarning] = React.useState(false)

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleMasterOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMasterEl(event.currentTarget)
  }

  const handleMasterClose = () => {
    setMasterEl(null)
  }

  const openTabMenu = (index: number, event: React.MouseEvent<HTMLElement>) => {
    setTabMenu({ index, anchor: event.currentTarget as HTMLElement })
  }

  const closeTabMenu = () => setTabMenu(null)
  const closeSubMenus = () => { setSubMenuL2(null); setSubMenuL3(null) }

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      handleMenuClose()
      
      // Use logout with timeout - will force logout after 3 seconds if not complete
      await authService.logoutWithTimeout(3000)
    } catch (error) {
      console.error('Logout error:', error)
      // Fallback to force logout
      authService.forceLogout()
    }
  }

  // Tick clock every 30s
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(id)
  }, [])

  // Handle session expiration
  React.useEffect(() => {
    if (sessionError && (sessionError.includes('expired') || sessionError.includes('invalid'))) {
      console.log('Session expired, redirecting to login...')
      setShowSessionWarning(true)
      // Clear local storage and redirect to login after a brief delay
      const timeoutId = setTimeout(() => {
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        navigate('/login', { replace: true })
      }, 2000)
      
      return () => clearTimeout(timeoutId)
    }
  }, [sessionError, navigate])

  // Handle session timeout from API interceptor
  React.useEffect(() => {
    const handleSessionTimeout = () => {
      setShowSessionWarning(true)
      // The API interceptor will handle the actual redirect
    }

    // Listen for custom session timeout events
    window.addEventListener('sessionTimeout', handleSessionTimeout)
    
    return () => {
      window.removeEventListener('sessionTimeout', handleSessionTimeout)
    }
  }, [])

  // Show session warning when session is about to expire
  React.useEffect(() => {
    if (!sessionValid && !sessionLoading && sessionError) {
      setShowSessionWarning(true)
    } else {
      setShowSessionWarning(false)
    }
  }, [sessionValid, sessionLoading, sessionError])

  const handleNavigation = (path: string) => {
    navigate(path)
  }

  // Get current tab index based on pathname and query parameters
  const getCurrentTabIndex = () => {
    const currentPath = location.pathname
    const searchParams = new URLSearchParams(location.search)
    const tParam = searchParams.get('t')
    const contextParam = searchParams.get('context')
    
    // Dashboard (index 0)
    if (currentPath === '/') return 0
    
    // OPD (index 1)
    if (currentPath.startsWith('/appointment') || 
        currentPath.startsWith('/quick-registration') ||
        currentPath.startsWith('/registration') ||
        (currentPath === '/billing' && contextParam === 'opd-dues')) return 1
    
    // OPD Reports (index 2)
    if (currentPath.startsWith('/reports')) return 2
    
    // OPD Master (index 3)
    // Check if settings path with OPD master query params (but not IPD master params)
    if (currentPath.startsWith('/settings')) {
      // IPD Report specific params
      if (tParam === 'treatment' || tParam === 'prescription') return 5
      // IPD Master specific params
      if (tParam === 'charges' || tParam === 'insurance' || 
          tParam === 'attach-treatment' || tParam === 'attach-prescription') return 6
      // Default to OPD Master for other settings paths
      return 3
    }
    
    // IPD (index 4)
    if (currentPath.startsWith('/manage-admission-card') || 
        currentPath.startsWith('/manage-advance-collection') || 
        currentPath.startsWith('/manage-discharge-card') || 
        currentPath.startsWith('/manage-hospital-bill')) return 4
    
    // IPD Report (index 5) - handled above in settings check
    
    // IPD Master (index 6) - handled above in settings check
    
    // Default fallback to OPD
    return 1
  }

  return (
    <GlobalWrapper>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <CssBaseline />
        {/* Top App Bar */}
        <AppBar position="static" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
          <Toolbar sx={{ justifyContent: 'space-between', minHeight: '56px !important', py: 0 }}>
            {/* Logo/Brand */}
            <Box sx={{ display: 'flex', alignItems: 'center', minWidth: '120px' }}>
              <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#ffffff !important' }}>
                MyHealth
              </Typography>
            </Box>

            {/* Navigation Tabs */}
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-start', maxWidth: 'calc(100vw - 240px)' }}>
              <Tabs
                value={getCurrentTabIndex()}
                onChange={(event, newValue) => {
                  const selectedItem = menuItems[newValue]
                  if (!selectedItem) return
                  openTabMenu(newValue, event as React.MouseEvent<HTMLElement>)
                }}
                variant={"scrollable"}
                scrollButtons={"auto"}
                allowScrollButtonsMobile
                sx={{
                  '& .MuiTab-root': {
                    minHeight: 48,
                    color: 'white',
                    padding: '6px 8px',
                    whiteSpace: 'nowrap',
                    '&.Mui-selected': {
                      color: 'white',
                    },
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: 'white',
                    height: '2px',
                  },
                }}
              >
                {menuItems.map((item, index) => (
                  <Tab
                    key={item.text}
                    onClick={(event: React.MouseEvent<HTMLElement>) => {
                      // Always open submenu, even if this tab is already active
                      openTabMenu(index, event)
                    }}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography component="span" sx={{ fontSize: isMobile ? '0.7rem' : '0.8rem' }}>
                          {item.text}
                        </Typography>
                        <KeyboardArrowDown sx={{ fontSize: isMobile ? 16 : 18 }} />
                      </Box>
                    }
                    sx={{
                      minWidth: 'auto',
                      maxWidth: 'none',
                      textTransform: 'none',
                    }}
                    aria-haspopup="menu"
                    aria-controls={tabMenu ? 'menu-tab' : undefined}
                    aria-expanded={Boolean(tabMenu) ? 'true' : undefined}
                  />
                ))}
              </Tabs>
              {/* Generic tab dropdown */}
              <Menu
                id="menu-tab"
                anchorEl={tabMenu?.anchor ?? null}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                open={Boolean(tabMenu)}
                onClose={() => { closeSubMenus(); closeTabMenu(); }}
                PaperProps={{
                  sx: {
                    '& .MuiMenuItem-root': {
                      pl: 1, // reduce left padding
                      pr: 2,
                    },
                  },
                }}
              >
                {(tabMenu ? subMenus[menuItems[tabMenu.index].text] || [] : []).map((item) => {
                  const hasChildren = Boolean((item as any).children && (item as any).children!.length)
                  return (
                    <MenuItem
                      key={item.label}
                      onMouseEnter={(e) => {
                        if (hasChildren) {
                          setSubMenuL2({ anchor: e.currentTarget as HTMLElement, items: (item as any).children! })
                          setSubMenuL3(null)
                        } else {
                          setSubMenuL2(null)
                          setSubMenuL3(null)
                        }
                      }}
                      onClick={() => { if (item.path) { handleNavigation(item.path); closeSubMenus(); closeTabMenu(); } }}
                      sx={{ pl: 1, pr: 2, minWidth: 240, display: 'flex', justifyContent: 'space-between', gap: 1 }}
                    >
                      {item.label}
                      {hasChildren ? <KeyboardArrowRight fontSize="small" /> : null}
                    </MenuItem>
                  )
                })}
              </Menu>

              {/* Level 2 submenu */}
              <Menu
                anchorEl={subMenuL2?.anchor ?? null}
                open={Boolean(subMenuL2)}
                onClose={() => setSubMenuL2(null)}
                keepMounted
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                MenuListProps={{ onMouseLeave: () => setSubMenuL2(null) }}
              >
                {subMenuL2?.items.map((item) => {
                  const hasChildren = Boolean((item as any).children && (item as any).children!.length)
                  return (
                    <MenuItem
                      key={item.label}
                      onMouseEnter={(e) => {
                        if (hasChildren) {
                          setSubMenuL3({ anchor: e.currentTarget as HTMLElement, items: (item as any).children! })
                        } else {
                          setSubMenuL3(null)
                        }
                      }}
                      onClick={() => { if (item.path) { handleNavigation(item.path); closeSubMenus(); closeTabMenu(); } }}
                      sx={{ minWidth: 260, display: 'flex', justifyContent: 'space-between', gap: 1 }}
                    >
                      {item.label}
                      {hasChildren ? <KeyboardArrowRight fontSize="small" /> : null}
                    </MenuItem>
                  )
                })}
              </Menu>

              {/* Level 3 submenu */}
              <Menu
                anchorEl={subMenuL3?.anchor ?? null}
                open={Boolean(subMenuL3)}
                onClose={() => setSubMenuL3(null)}
                keepMounted
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                MenuListProps={{ onMouseLeave: () => setSubMenuL3(null) }}
              >
                {subMenuL3?.items.map((item) => (
                  <MenuItem
                    key={item.label}
                    onClick={() => { if (item.path) { handleNavigation(item.path); closeSubMenus(); closeTabMenu(); } }}
                    sx={{ minWidth: 280 }}
                  >
                    {item.label}
                  </MenuItem>
                ))}
              </Menu>
            </Box>

            {/* Date and User Menu */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography component="div" sx={{ color: '#FFFFFF', fontSize: '0.9rem', fontWeight: 600 }}>
                {(() => {
                  const d = now
                  const dd = String(d.getDate()).padStart(2, '0')
                  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
                  const mmm = monthNames[d.getMonth()]
                  const yy = String(d.getFullYear()).slice(-2)
                  return `${dd}-${mmm}-${yy}`
                })()}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', minWidth: '120px', justifyContent: 'flex-end' }}>
              <Tooltip title={sessionLoading ? 'Loading...' : `${username} (${doctorName || 'Doctor'})`}>
                <IconButton
                  size="medium"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenuClick}
                  color="inherit"
                  sx={{ padding: '4px' }}
                >
                  <Avatar sx={{ width: 28, height: 28 }}>
                    {sessionLoading ? (
                      <span style={{ fontSize: '12px' }}>⏳</span>
                    ) : (
                      <span style={{ fontSize: '12px', fontWeight: 'bold' }}>
                        {username ? username.charAt(0).toUpperCase() : 'U'}
                      </span>
                    )}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleMenuClose}>
                  <ListItemIcon>
                    <AccountCircle fontSize="small" />
                  </ListItemIcon>
                  {sessionLoading ? 'Loading...' : `${username} (${clinicName || 'Clinic'})`}
                </MenuItem>
                <MenuItem onClick={handleLogout} disabled={isLoggingOut}>
                  <ListItemIcon>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Box
          component="main"
          className="body"
          sx={{
            flexGrow: 1,
            height: 'calc(100vh - 64px)', // Subtract AppBar height
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            background: '#f8f9fa', // Match appointment screen background
          }}
        >
          {/* Session Warning */}
          {showSessionWarning && (
            <Box
              sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 9999,
                backgroundColor: '#ff9800',
                color: 'white',
                padding: 2,
                textAlign: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              <Typography variant="body1">
                Session expired. Redirecting to login page...
              </Typography>
            </Box>
          )}
          {children}
        </Box>
        
        {/* Session Timeout Handler */}
        <SessionTimeoutHandler 
          warningTimeMinutes={getSessionConfig().warningTimeMinutes}
          sessionTimeoutMinutes={getSessionConfig().sessionTimeoutMinutes}
          onSessionTimeout={() => {
            console.log('Session timeout handled by SessionTimeoutHandler')
          }}
        />
      </Box>
    </GlobalWrapper>
  )
}
