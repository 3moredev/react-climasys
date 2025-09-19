import { useEffect, useState } from 'react'
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button, Alert, CircularProgress } from '@mui/material'
import { Science, Add, Visibility, Assignment } from '@mui/icons-material'

export default function LabPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLabTests = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/lab/tests?doctorId=DR-00001')
        const data = await response.json()
        setItems(data.items || [])
      } catch (err) {
        setError('Failed to load lab tests')
      } finally {
        setLoading(false)
      }
    }
    
    fetchLabTests()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'success'
      case 'pending': return 'warning'
      case 'in_progress': return 'info'
      default: return 'default'
    }
  }

  return (
    <Box className="page-container">
      {/* Header */}
      <Box className="page-header">
        <Box display="flex" alignItems="center" gap={2}>
          <Science sx={{ fontSize: '2rem' }} />
          <Box>
            <Typography variant="h4" component="h1" className="page-title">
              Lab Tests
            </Typography>
            <Typography variant="subtitle1" className="page-subtitle">
              Manage laboratory tests and view results
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Quick Actions */}
      <Paper className="content-card">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" className="content-card-title">
            Lab Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            className="form-button"
          >
            New Lab Test
          </Button>
        </Box>
      </Paper>

      {/* Lab Tests Table */}
      <Paper className="data-table">
        <TableContainer>
          <Table>
            <TableHead className="data-table-header">
              <TableRow>
                <TableCell>Test ID</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Test Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress className="loading-spinner" />
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      Loading lab tests...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Alert severity="error" className="dashboard-alert">
                      {error}
                    </Alert>
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Box className="empty-state">
                      <Science className="empty-state-icon" />
                      <Typography variant="h6" className="empty-state-title">
                        No Lab Tests Found
                      </Typography>
                      <Typography variant="body2" className="empty-state-description">
                        No laboratory tests have been ordered yet.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, index) => (
                  <TableRow key={index} className="data-table-row">
                    <TableCell className="data-table-cell">
                      {item.testId || `TEST-${index + 1}`}
                    </TableCell>
                    <TableCell className="data-table-cell">
                      {item.patientName || 'Unknown Patient'}
                    </TableCell>
                    <TableCell className="data-table-cell">
                      {item.testType || 'General Test'}
                    </TableCell>
                    <TableCell className="data-table-cell">
                      <Chip
                        label={item.status || 'Pending'}
                        color={getStatusColor(item.status) as any}
                        size="small"
                        className="status-chip"
                      />
                    </TableCell>
                    <TableCell className="data-table-cell">
                      {item.date || new Date().toLocaleDateString()}
                    </TableCell>
                    <TableCell className="data-table-cell">
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        className="action-button"
                      >
                        View
                      </Button>
                      <Button
                        size="small"
                        startIcon={<Assignment />}
                        className="action-button secondary"
                      >
                        Report
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Debug Info (for development) */}
      {process.env.NODE_ENV === 'development' && items.length > 0 && (
        <Paper className="content-card">
          <Typography variant="h6" className="content-card-title">
            Debug Information
          </Typography>
          <Box component="pre" sx={{ 
            backgroundColor: '#f5f5f5', 
            padding: 2, 
            borderRadius: 1, 
            overflow: 'auto',
            fontSize: '0.8rem'
          }}>
            {JSON.stringify(items, null, 2)}
          </Box>
        </Paper>
      )}
    </Box>
  )
}


