import { useState, useEffect } from 'react'
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button, Alert, CircularProgress, TextField, Grid, Card, CardContent } from '@mui/material'
import { LocalPharmacy, Add, Visibility, Edit, Search, Medication, Inventory, Receipt } from '@mui/icons-material'
import ClearableTextField from '../components/ClearableTextField'

export default function PharmacyPage() {
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [medicines, setMedicines] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchPharmacyData = async () => {
      try {
        setLoading(true)
        // Mock data for demonstration
        const mockPrescriptions = [
          { id: 1, patientName: 'John Doe', medicine: 'Paracetamol', dosage: '500mg', quantity: 30, status: 'pending' },
          { id: 2, patientName: 'Jane Smith', medicine: 'Amoxicillin', dosage: '250mg', quantity: 20, status: 'dispensed' },
          { id: 3, patientName: 'Bob Johnson', medicine: 'Ibuprofen', dosage: '400mg', quantity: 15, status: 'pending' }
        ]

        const mockMedicines = [
          { id: 1, name: 'Paracetamol', stock: 150, price: 2.50, category: 'Pain Relief' },
          { id: 2, name: 'Amoxicillin', stock: 75, price: 5.00, category: 'Antibiotic' },
          { id: 3, name: 'Ibuprofen', stock: 200, price: 3.25, category: 'Pain Relief' },
          { id: 4, name: 'Aspirin', stock: 100, price: 1.75, category: 'Pain Relief' }
        ]

        setPrescriptions(mockPrescriptions)
        setMedicines(mockMedicines)
      } catch (err) {
        setError('Failed to load pharmacy data')
      } finally {
        setLoading(false)
      }
    }

    fetchPharmacyData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'dispensed': return 'success'
      case 'pending': return 'warning'
      case 'cancelled': return 'error'
      default: return 'default'
    }
  }

  const filteredPrescriptions = prescriptions.filter(prescription =>
    prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.medicine.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Box className="page-container">
      {/* Header */}
      <Box className="page-header">
        <Box display="flex" alignItems="center" gap={2}>
          <LocalPharmacy sx={{ fontSize: '2rem' }} />
          <Box>
            <Typography variant="h4" component="h1" className="page-title">
              Pharmacy Management
            </Typography>
            <Typography variant="subtitle1" className="page-subtitle">
              Manage prescriptions, medicines, and inventory
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Search and Quick Actions */}
      <Paper className="search-filter-bar">
        <ClearableTextField
          placeholder="Search prescriptions or medicines..."
          value={searchTerm}
          onChange={setSearchTerm}
          className="search-input"
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: '#3a6f9f' }} />
          }}
        />
        <Button
          variant="contained"
          startIcon={<Add />}
          className="form-button"
        >
          New Prescription
        </Button>
        <Button
          variant="outlined"
          startIcon={<Inventory />}
          className="action-button secondary"
        >
          Inventory
        </Button>
      </Paper>

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="stat-card blue">
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" className="stat-card-title">
                    Pending Prescriptions
                  </Typography>
                  <Typography variant="h3" className="stat-card-value">
                    {prescriptions.filter(p => p.status === 'pending').length}
                  </Typography>
                  <Typography variant="body2" className="stat-card-subtitle">
                    Awaiting dispensing
                  </Typography>
                </Box>
                <Box className="stat-card-icon">
                  <Receipt />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="stat-card green">
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" className="stat-card-title">
                    Total Medicines
                  </Typography>
                  <Typography variant="h3" className="stat-card-value">
                    {medicines.length}
                  </Typography>
                  <Typography variant="body2" className="stat-card-subtitle">
                    In inventory
                  </Typography>
                </Box>
                <Box className="stat-card-icon">
                  <Medication />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="stat-card orange">
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" className="stat-card-title">
                    Low Stock
                  </Typography>
                  <Typography variant="h3" className="stat-card-value">
                    {medicines.filter(m => m.stock < 50).length}
                  </Typography>
                  <Typography variant="body2" className="stat-card-subtitle">
                    Need restocking
                  </Typography>
                </Box>
                <Box className="stat-card-icon">
                  <Inventory />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="stat-card purple">
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" className="stat-card-title">
                    Dispensed Today
                  </Typography>
                  <Typography variant="h3" className="stat-card-value">
                    {prescriptions.filter(p => p.status === 'dispensed').length}
                  </Typography>
                  <Typography variant="body2" className="stat-card-subtitle">
                    Completed orders
                  </Typography>
                </Box>
                <Box className="stat-card-icon">
                  <LocalPharmacy />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Prescriptions Table */}
      <Paper className="data-table" sx={{ mb: 3 }}>
        <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" className="content-card-title">
            Prescriptions
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Add />}
            className="action-button"
          >
            Add Prescription
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead className="data-table-header">
              <TableRow>
                <TableCell>Patient</TableCell>
                <TableCell>Medicine</TableCell>
                <TableCell>Dosage</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress className="loading-spinner" />
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      Loading prescriptions...
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
              ) : filteredPrescriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Box className="empty-state">
                      <LocalPharmacy className="empty-state-icon" />
                      <Typography variant="h6" className="empty-state-title">
                        No Prescriptions Found
                      </Typography>
                      <Typography variant="body2" className="empty-state-description">
                        {searchTerm ? 'No prescriptions match your search.' : 'No prescriptions have been created yet.'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPrescriptions.map((prescription) => (
                  <TableRow key={prescription.id} className="data-table-row">
                    <TableCell className="data-table-cell">
                      {prescription.patientName}
                    </TableCell>
                    <TableCell className="data-table-cell">
                      {prescription.medicine}
                    </TableCell>
                    <TableCell className="data-table-cell">
                      {prescription.dosage}
                    </TableCell>
                    <TableCell className="data-table-cell">
                      {prescription.quantity}
                    </TableCell>
                    <TableCell className="data-table-cell">
                      <Chip
                        label={prescription.status}
                        color={getStatusColor(prescription.status) as any}
                        size="small"
                        className="status-chip"
                      />
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
                        startIcon={<Edit />}
                        className="action-button secondary"
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Medicine Inventory */}
      <Paper className="data-table">
        <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" className="content-card-title">
            Medicine Inventory
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Add />}
            className="action-button"
          >
            Add Medicine
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead className="data-table-header">
              <TableRow>
                <TableCell>Medicine Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMedicines.map((medicine) => (
                <TableRow key={medicine.id} className="data-table-row">
                  <TableCell className="data-table-cell">
                    {medicine.name}
                  </TableCell>
                  <TableCell className="data-table-cell">
                    {medicine.category}
                  </TableCell>
                  <TableCell className="data-table-cell">
                    {medicine.stock}
                  </TableCell>
                  <TableCell className="data-table-cell">
                    ₹{medicine.price}
                  </TableCell>
                  <TableCell className="data-table-cell">
                    <Chip
                      label={medicine.stock < 50 ? 'Low Stock' : 'In Stock'}
                      color={medicine.stock < 50 ? 'warning' : 'success'}
                      size="small"
                      className="status-chip"
                    />
                  </TableCell>
                  <TableCell className="data-table-cell">
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      className="action-button"
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Inventory />}
                      className="action-button secondary"
                    >
                      Restock
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  )
}