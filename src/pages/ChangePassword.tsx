import React, { useState } from 'react'
import {
    Button,
    TextField,
    Box,
    Alert,
    IconButton,
    InputAdornment,
    Snackbar,
    Paper,
    Typography,
    Container
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { authService } from '../services/authService'
import { useNavigate } from 'react-router-dom'

const ChangePasswordPage = () => {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    // Visibility states
    const [showOldPassword, setShowOldPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
        if (error) setError(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (formData.newPassword !== formData.confirmPassword) {
            setError("New passwords don't match")
            return
        }

        if (formData.newPassword.length < 6) {
            setError("Password must be at least 6 characters long")
            return
        }

        try {
            setLoading(true)
            const user = authService.getCurrentUser()
            console.log('Current User:', user) // DEBUG LOG

            if (!user) {
                setError("User session not found. Please login again.")
                setTimeout(() => navigate('/login'), 2000)
                setLoading(false)
                return
            }

            const loginId = user.loginId || user.login_id || user.username
            console.log('Sending Change Password Request for:', loginId) // DEBUG LOG

            if (!loginId) {
                console.warn("User login ID missing in frontend object. Attempting with backend session fallback.")
                // We do NOT return here anymore; we let the backend handle it via session
            }

            await authService.changePassword({
                loginId: loginId || '', // Send empty string if undefined, backend will handle
                oldPassword: formData.oldPassword,
                newPassword: formData.newPassword
            })

            setSuccess(true)
            setTimeout(() => {
                navigate('/')
            }, 1000)
        } catch (err: any) {
            console.error('Change password error:', err)
            // Enhanced error logging
            if (err.response) {
                console.error('Error response data:', err.response.data)
                console.error('Error response status:', err.response.status)
            }

            const serverMsg = err.response?.data?.message
            setError(serverMsg || err.message || 'Failed to change password. Please check your old password.')
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
        navigate(-1)
    }

    return (
        <Box sx={{ width: '100%', height: '100%', bgcolor: 'white', display: 'flex', flexDirection: 'column', fontFamily: "'Roboto', sans-serif" }}>
            {/* Header Strip */}
            <Box sx={{
                width: '100%',
                borderBottom: '1px solid #ddd',
                mb: 4,
                px: 3,
                py: 1.5,
                bgcolor: 'white' // Ensure header is white
            }}>
                <Typography variant="h6" sx={{ color: '#428bca', fontWeight: 400 }}>
                    Change Password
                </Typography>
            </Box>

            <Container maxWidth="md" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1 }}>

                <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '700px' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                        {/* Current Password */}
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <Box sx={{ width: '35%', textAlign: 'right', pr: 3 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                    Current Password:<span style={{ color: 'red', marginLeft: '4px' }}>*</span>
                                </Typography>
                            </Box>
                            <Box sx={{ width: '65%', position: 'relative' }}>
                                <TextField
                                    name="oldPassword"
                                    type={showOldPassword ? 'text' : 'password'}
                                    value={formData.oldPassword}
                                    onChange={handleChange}
                                    placeholder="Current Password"
                                    required
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    InputProps={{
                                        sx: {
                                            borderRadius: '4px',
                                            height: '35px',
                                            backgroundColor: 'white',
                                            '& fieldset': { borderColor: '#b2dfdb' },
                                            '&:hover fieldset': { borderColor: '#80cbc4' },
                                            '&.Mui-focused fieldset': { borderColor: '#4db6ac' },
                                            '& input::placeholder': { opacity: 0.6 },
                                            '& input::-ms-reveal': { display: 'none', width: 0, height: 0 },
                                            '& input::-ms-clear': { display: 'none', width: 0, height: 0 }
                                        },
                                    }}
                                />

                                {/* 👁 Same SVG Eye Icon */}
                                <span
                                    onClick={() => setShowOldPassword(!showOldPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        cursor: 'pointer',
                                        color: '#666666',
                                        userSelect: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '20px',
                                        height: '20px'
                                    }}
                                >
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                        {showOldPassword && (
                                            <line
                                                x1="1"
                                                y1="1"
                                                x2="23"
                                                y2="23"
                                                stroke="#ff4444"
                                                strokeWidth="2"
                                            />
                                        )}
                                    </svg>
                                </span>
                            </Box>

                        </Box>

                        {/* New Password */}
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <Box sx={{ width: '35%', textAlign: 'right', pr: 3 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                    New Password:<span style={{ color: 'red', marginLeft: '4px' }}>*</span>
                                </Typography>
                            </Box>
                            <Box sx={{ width: '65%', position: 'relative' }}>
                                <TextField
                                    name="newPassword"
                                    type={showNewPassword ? 'text' : 'password'}
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    placeholder="New Password"
                                    required
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    InputProps={{
                                        sx: {
                                            borderRadius: '4px',
                                            height: '35px',
                                            backgroundColor: 'white',
                                            '& fieldset': { borderColor: '#b2dfdb' },
                                            '&:hover fieldset': { borderColor: '#80cbc4' },
                                            '&.Mui-focused fieldset': { borderColor: '#4db6ac' },
                                            '& input::placeholder': { opacity: 0.6 },
                                        },
                                    }}
                                />

                                <span
                                    className="ptwikki-eye-icon"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        cursor: 'pointer',
                                        color: '#666666',
                                        userSelect: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '20px',
                                        height: '20px'
                                    }}
                                >
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                        {showNewPassword && (
                                            <line
                                                x1="1"
                                                y1="1"
                                                x2="23"
                                                y2="23"
                                                stroke="#ff4444"
                                                strokeWidth="2"
                                            />
                                        )}
                                    </svg>
                                </span>
                            </Box>


                        </Box>

                        {/* Confirm Password */}
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <Box sx={{ width: '35%', textAlign: 'right', pr: 3 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                    Confirm Password:<span style={{ color: 'red', marginLeft: '4px' }}>*</span>
                                </Typography>
                            </Box>
                            <Box sx={{ width: '65%', position: 'relative' }}>
                                <TextField
                                    name="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm Password"
                                    required
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    InputProps={{
                                        sx: {
                                            borderRadius: '4px',
                                            height: '35px',
                                            backgroundColor: 'white',
                                            '& fieldset': { borderColor: '#b2dfdb' },
                                            '&:hover fieldset': { borderColor: '#80cbc4' },
                                            '&.Mui-focused fieldset': { borderColor: '#4db6ac' },
                                            '& input::placeholder': { opacity: 0.6 },
                                        },
                                    }}
                                />

                                <span
                                    className="ptwikki-eye-icon"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        cursor: 'pointer',
                                        color: '#666666',
                                        userSelect: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '20px',
                                        height: '20px'
                                    }}
                                >
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                        {showConfirmPassword && (
                                            <line x1="1" y1="1" x2="23" y2="23" stroke="#ff4444" strokeWidth="2" />
                                        )}
                                    </svg>
                                </span>
                            </Box>

                        </Box>

                        {/* Buttons */}
                        <Box sx={{ display: 'flex', gap: 2, mt: 2, justifyContent: 'center' }}>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={loading}
                                sx={{
                                    bgcolor: '#428bca',
                                    '&:hover': { bgcolor: '#3071a9' },
                                    textTransform: 'none',
                                    minWidth: '80px',
                                    borderRadius: '4px',
                                    boxShadow: 'none',
                                    height: '34px'
                                }}
                            >
                                {loading ? 'Submitting...' : 'Submit'}
                            </Button>
                            <Button
                                onClick={handleCancel}
                                disabled={loading}
                                variant="contained"
                                sx={{
                                    bgcolor: '#428bca',
                                    '&:hover': { bgcolor: '#3071a9' },
                                    textTransform: 'none',
                                    minWidth: '80px',
                                    borderRadius: '4px',
                                    boxShadow: 'none',
                                    height: '34px'
                                }}
                            >
                                Cancel
                            </Button>
                        </Box>
                    </Box>
                </form>
            </Container>

            <Snackbar
                open={success}
                autoHideDuration={6000}
                onClose={() => setSuccess(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
                    Password changed successfully!
                </Alert>
            </Snackbar>
        </Box>
    )
}

export default ChangePasswordPage
