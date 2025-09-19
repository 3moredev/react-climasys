import React, { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Chip,
} from '@mui/material'
import {
  Payment,
  Receipt,
  Visibility,
  Edit,
  Print,
} from '@mui/icons-material'
import ScrollableTable from '../components/Table/ScrollableTable'

// Mock data
const mockVisits = [
  { visitId: 'V001', patientName: 'John Doe', amount: 2500, status: 'pending' },
  { visitId: 'V002', patientName: 'Jane Smith', amount: 1800, status: 'paid' },
  { visitId: 'V003', patientName: 'Bob Johnson', amount: 3200, status: 'overdue' },
  { visitId: 'V004', patientName: 'Alice Brown', amount: 1500, status: 'pending' },
  { visitId: 'V005', patientName: 'Charlie Wilson', amount: 2800, status: 'paid' },
  { visitId: 'V006', patientName: 'Diana Lee', amount: 2100, status: 'pending' },
  { visitId: 'V007', patientName: 'Eve Davis', amount: 1900, status: 'overdue' },
  { visitId: 'V008', patientName: 'Frank Miller', amount: 2400, status: 'paid' },
  { visitId: 'V009', patientName: 'Grace Taylor', amount: 1700, status: 'pending' },
  { visitId: 'V010', patientName: 'Henry Anderson', amount: 2600, status: 'paid' },
]

const billingItems = [
  { id: '1', description: 'Consultation Fee', quantity: 1, unitPrice: 500, total: 500 },
  { id: '2', description: 'Lab Tests', quantity: 3, unitPrice: 200, total: 600 },
  { id: '3', description: 'Medication', quantity: 2, unitPrice: 150, total: 300 },
]

export default function BillingOptimized() {
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false)
  const [openReceiptDialog, setOpenReceiptDialog] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success'
      case 'pending': return 'warning'
      case 'overdue': return 'error'
      default: return 'default'
    }
  }

  const calculateTotal = () => {
    return billingItems.reduce((sum, item) => sum + item.total, 0)
  }

  const calculateTax = (subtotal: number) => {
    return subtotal * 0.18
  }

  const calculateGrandTotal = () => {
    const subtotal = calculateTotal()
    const tax = calculateTax(subtotal)
    return subtotal + tax
  }

  const tableColumns = [
    {
      key: 'visitId',
      label: 'Visit ID',
      width: '120px',
    },
    {
      key: 'patientName',
      label: 'Patient',
      width: '200px',
    },
    {
      key: 'amount',
      label: 'Amount',
      width: '120px',
      align: 'right' as const,
      render: (value: number) => `₹${value.toLocaleString()}`,
    },
    {
      key: 'status',
      label: 'Status',
      width: '120px',
      align: 'center' as const,
      render: (value: string) => (
        <Chip
          label={value}
          color={getStatusColor(value) as any}
          size="small"
        />
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '150px',
      align: 'center' as const,
      render: () => (
        <Box className="table-cell-actions">
          <Button className="table-action-btn" size="small">
            <Visibility />
          </Button>
          <Button className="table-action-btn" size="small">
            <Edit />
          </Button>
          <Button className="table-action-btn" size="small">
            <Print />
          </Button>
        </Box>
      ),
    },
  ]

  const filterOptions = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Paid', value: 'paid' },
    { label: 'Overdue', value: 'overdue' },
  ]

  const tableActions = (
    <>
      <Button
        variant="outlined"
        size="small"
        startIcon={<Payment />}
        onClick={() => setOpenPaymentDialog(true)}
      >
        Process Payment
      </Button>
      <Button
        variant="contained"
        size="small"
        startIcon={<Receipt />}
        onClick={() => setOpenReceiptDialog(true)}
      >
        Generate Receipt
      </Button>
    </>
  )

  return (
    <Box className="billing-container">
      {/* Header */}
      <Box className="billing-header">
        <Box display="flex" alignItems="center" gap={2}>
          <Receipt sx={{ fontSize: '2rem' }} />
          <Box>
            <Typography variant="h4" component="h1" className="page-title">
              Billing & Payments
            </Typography>
            <Typography variant="subtitle1" className="page-subtitle">
              Manage billing, payments, and financial records
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box className="billing-content">
        {/* Left Panel - Pending Bills Table */}
        <Box className="billing-left-panel">
          <ScrollableTable
            title="Pending Bills"
            data={mockVisits}
            columns={tableColumns}
            searchPlaceholder="Search bills..."
            filterOptions={filterOptions}
            actions={tableActions}
            pagination={{
              current: 1,
              total: mockVisits.length,
              pageSize: 10,
              onPageChange: (page) => console.log('Page changed to:', page),
            }}
            emptyMessage="No pending bills found"
          />
        </Box>

        {/* Right Panel - Billing Summary & Payment Form */}
        <Box className="billing-right-panel">
          {/* Billing Summary */}
          <Box className="billing-summary-card">
            <Typography variant="h6" gutterBottom>
              Billing Summary
            </Typography>
            <List>
              {billingItems.map((item) => (
                <ListItem key={item.id} disablePadding>
                  <ListItemText
                    primary={item.description}
                    secondary={`${item.quantity} × ₹${item.unitPrice}`}
                  />
                  <ListItemSecondaryAction>
                    <Typography variant="body2" fontWeight="bold">
                      ₹{item.total}
                    </Typography>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
            <Divider sx={{ my: 2 }} />
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography>Subtotal:</Typography>
              <Typography>₹{calculateTotal().toLocaleString()}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography>Tax (18%):</Typography>
              <Typography>₹{calculateTax(calculateTotal()).toLocaleString()}</Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box display="flex" justifyContent="space-between">
              <Typography variant="h6" fontWeight="bold">Total:</Typography>
              <Typography variant="h6" fontWeight="bold">
                ₹{calculateGrandTotal().toLocaleString()}
              </Typography>
            </Box>
          </Box>

          {/* Payment Form */}
          <Box className="billing-payment-form">
            <Typography variant="h6" gutterBottom>
              Quick Payment
            </Typography>
            <Box display="flex" gap={1} mb={2}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Payment />}
                onClick={() => setOpenPaymentDialog(true)}
                fullWidth
              >
                Process Payment
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<Receipt />}
                onClick={() => setOpenReceiptDialog(true)}
                fullWidth
              >
                Generate Receipt
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
