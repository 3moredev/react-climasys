import React from 'react'
import { Box } from '@mui/material'

interface GlobalWrapperProps {
  children: React.ReactNode
  className?: string
}

/**
 * GlobalWrapper component that automatically applies global CSS classes
 * to ensure consistent styling across all pages
 */
export default function GlobalWrapper({ children, className = '' }: GlobalWrapperProps) {
  return (
    <Box 
      className={`page page-bg ${className}`}
      sx={{
        height: '100vh',
        width: '100%',
        margin: 0,
        padding: 0,
        overflow: 'visible', // Changed from 'hidden' to 'visible' to allow dropdowns to be visible
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {children}
    </Box>
  )
}
