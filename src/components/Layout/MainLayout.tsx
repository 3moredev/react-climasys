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
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { logout } from '../../store/slices/authSlice'

interface MainLayoutProps {
  children: React.ReactNode
}

const menuItems = [
  { text: 'Dashboard', path: '/' },
  { text: 'OPD',  path: '/appointment' },
  { text: 'OPD Reports',  path: '/reports' },
  { text: 'OPD Master', path: '#' },
  { text: 'Settings', path: '/settings' },
]

const subMenus: Record<string, Array<{ label: string; path: string }>> = {
  'Dashboard': [
    { label: 'Dashboard', path: '/' },
  ],
  'OPD': [
    { label: "Today's Appointments", path: '/appointment' },
    { label: 'OPD - Collect Patient Dues', path: '/billing?context=opd-dues' },
    { label: 'Patient - Quick Registration', path: '/registration?type=quick' },
    { label: 'Patient - Detailed Registration', path: '/registration?type=detailed' },
    { label: 'Patient - Print Registration Form', path: '/registration?print=1' },
  ],
  'OPD Reports': [
    { label: 'OPD – Daily Collection', path: '/reports?type=daily-collection' },
    { label: 'OPD - Receipts', path: '/reports?type=receipts' },
    { label: 'Dashboard & Reports', path: '/reports?type=dashboard' },
  ],
  'OPD Master': [
    { label: 'Treatment Master', path: '/settings?t=treatment' },
    { label: 'Prescription Master', path: '/settings?t=prescription' },
    { label: 'Billing', path: '/billing' },
  ],
  'Settings': [
    { label: 'Settings', path: '/settings' },
  ],
}

export default function MainLayout({ children }: MainLayoutProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  
  const { user } = useAppSelector((state) => state.auth)
  
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [masterEl, setMasterEl] = React.useState<null | HTMLElement>(null)
  const [tabMenu, setTabMenu] = React.useState<{ index: number; anchor: HTMLElement } | null>(null)
  const [now, setNow] = React.useState<Date>(new Date())

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

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
    handleMenuClose()
  }

  // Tick clock every 30s
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(id)
  }, [])

  const handleNavigation = (path: string) => {
    navigate(path)
  }

  // Get current tab index based on pathname
  const getCurrentTabIndex = () => {
    const currentPath = location.pathname
    if (currentPath === '/') return 0
    if (currentPath.startsWith('/appointment')) return 1
    if (currentPath.startsWith('/reports')) return 2
    if (['/patients','/visits','/lab','/pharmacy','/billing'].includes(currentPath)) return 3
    if (currentPath.startsWith('/settings')) return 4
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
              <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                Climasys
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
                onClose={closeTabMenu}
                PaperProps={{
                  sx: {
                    '& .MuiMenuItem-root': {
                      pl: 1, // reduce left padding
                      pr: 2,
                    },
                  },
                }}
              >
                {(tabMenu ? subMenus[menuItems[tabMenu.index].text] || [] : []).map((item) => (
                  <MenuItem
                    key={item.label}
                    onClick={() => { handleNavigation(item.path); closeTabMenu() }}
                    sx={{ pl: 1, pr: 2 }}
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
              <Tooltip title={user ? `${user.firstName} (${user.roleName})` : 'User'}>
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
                    <AccountCircle />
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
                  {user ? `${user.firstName} (${user.loginId})` : 'Profile'}
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  Logout
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
          }}
        >
          {children}
        </Box>
      </Box>
    </GlobalWrapper>
  )
}
