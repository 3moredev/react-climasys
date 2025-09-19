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
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../../store'
import { logout } from '../../store/slices/authSlice'

interface MainLayoutProps {
  children: React.ReactNode
}

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/' },
  { text: 'Patients', icon: <People />, path: '/patients' },
  { text: 'Appointments', icon: <CalendarToday />, path: '/appointments' },
  { text: 'Visits', icon: <CalendarToday />, path: '/visits' },
  { text: 'Lab Tests', icon: <Science />, path: '/lab' },
  { text: 'Pharmacy', icon: <LocalPharmacy />, path: '/pharmacy' },
  { text: 'Billing', icon: <Receipt />, path: '/billing' },
  { text: 'Reports', icon: <Assessment />, path: '/reports' },
  { text: 'Settings', icon: <Settings />, path: '/settings' },
]

export default function MainLayout({ children }: MainLayoutProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  
  const { user } = useSelector((state: RootState) => state.auth)
  
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
    handleMenuClose()
  }

  const handleNavigation = (path: string) => {
    navigate(path)
  }

  // Get current tab index based on pathname
  const getCurrentTabIndex = () => {
    const currentPath = location.pathname
    const index = menuItems.findIndex(item => item.path === currentPath)
    return index >= 0 ? index : 0
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
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', maxWidth: 'calc(100vw - 240px)' }}>
              <Tabs
                value={getCurrentTabIndex()}
                onChange={(event, newValue) => {
                  const selectedItem = menuItems[newValue]
                  if (selectedItem) {
                    handleNavigation(selectedItem.path)
                  }
                }}
                variant={isMobile ? "scrollable" : "standard"}
                scrollButtons={isMobile ? "auto" : false}
                allowScrollButtonsMobile
                sx={{
                  '& .MuiTab-root': {
                    minHeight: 48,
                    color: 'rgba(255, 255, 255, 0.7)',
                    padding: '6px 8px',
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
                    label={item.text}
                    icon={item.icon}
                    iconPosition="start"
                    sx={{
                      minWidth: isMobile ? 'auto' : 100,
                      maxWidth: isMobile ? 'auto' : 120,
                      fontSize: isMobile ? '0.7rem' : '0.8rem',
                      '& .MuiTab-iconWrapper': {
                        marginRight: '4px',
                        fontSize: '1rem',
                      },
                    }}
                  />
                ))}
              </Tabs>
            </Box>

            {/* User Menu */}
            <Box sx={{ display: 'flex', alignItems: 'center', minWidth: '120px', justifyContent: 'flex-end' }}>
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
                  Profile
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
