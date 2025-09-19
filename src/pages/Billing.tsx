import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  InputAdornment,
} from '@mui/material'
import {
  Add,
  Edit,
  Visibility,
  Receipt,
  Payment,
  Print,
  Download,
  Search,
  AttachMoney,
  CreditCard,
  AccountBalanceWallet,
} from '@mui/icons-material'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import { useForm, Controller } from 'react-hook-form'
import axios from 'axios'

interface PaymentFormData {
  visitId: string
  patientId: string
  amount: string
  paymentMode: string
  paymentReference: string
  notes: string
}

interface ReceiptFormData {
  visitId: string
  patientId: string
  totalAmount: string
  paidAmount: string
  discountAmount: string
  taxAmount: string
  paymentMode: string
  receiptNumber: string
}

interface BillingItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
  category: string
}

export default function Billing() {
  const dispatch = useDispatch()
  const { user } = useSelector((state: RootState) => state.auth)
  
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false)
  const [openReceiptDialog, setOpenReceiptDialog] = useState(false)
  const [selectedVisit, setSelectedVisit] = useState<any>(null)
  const [billingItems, setBillingItems] = useState<BillingItem[]>([])
  const [loading, setLoading] = useState(false)

  const { control: paymentControl, handleSubmit: handlePaymentSubmit, reset: resetPayment } = useForm<PaymentFormData>({
    defaultValues: {
      visitId: '',
      patientId: '',
      amount: '',
      paymentMode: 'cash',
      paymentReference: '',
      notes: '',
    }
  })

  const { control: receiptControl, handleSubmit: handleReceiptSubmit, reset: resetReceipt } = useForm<ReceiptFormData>({
    defaultValues: {
      visitId: '',
      patientId: '',
      totalAmount: '',
      paidAmount: '',
      discountAmount: '0',
      taxAmount: '0',
      paymentMode: 'cash',
      receiptNumber: '',
    }
  })

  // Mock data for demonstration
  const mockVisits = [
    { visitId: 'V001', patientId: 'P001', patientName: 'John Doe', amount: 1500, status: 'pending' },
    { visitId: 'V002', patientId: 'P002', patientName: 'Jane Smith', amount: 2200, status: 'paid' },
    { visitId: 'V003', patientId: 'P003', patientName: 'Mike Johnson', amount: 800, status: 'pending' },
  ]

  const mockBillingItems: BillingItem[] = [
    { id: '1', description: 'Consultation Fee', quantity: 1, unitPrice: 500, total: 500, category: 'consultation' },
    { id: '2', description: 'Lab Test - Blood Sugar', quantity: 1, unitPrice: 200, total: 200, category: 'lab' },
    { id: '3', description: 'Medicine - Paracetamol', quantity: 2, unitPrice: 50, total: 100, category: 'pharmacy' },
  ]

  useEffect(() => {
    setBillingItems(mockBillingItems)
  }, [])

  const handleProcessPayment = async (data: PaymentFormData) => {
    setLoading(true)
    try {
      const response = await axios.post('/api/billing/payments', data)
      console.log('Payment processed:', response.data)
      setOpenPaymentDialog(false)
      resetPayment()
    } catch (error) {
      console.error('Payment failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateReceipt = async (data: ReceiptFormData) => {
    setLoading(true)
    try {
      const response = await axios.post('/api/billing/receipts', data)
      console.log('Receipt generated:', response.data)
      setOpenReceiptDialog(false)
      resetReceipt()
    } catch (error) {
      console.error('Receipt generation failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'success'
      case 'pending': return 'warning'
      case 'cancelled': return 'error'
      default: return 'default'
    }
  }

  const getPaymentModeIcon = (mode: string) => {
    switch (mode.toLowerCase()) {
      case 'cash': return <AccountBalanceWallet />
      case 'card': return <CreditCard />
      case 'upi': return <Payment />
      default: return <AttachMoney />
    }
  }

  const calculateTotal = () => {
    return billingItems.reduce((sum, item) => sum + item.total, 0)
  }

  const calculateTax = (amount: number) => {
    return amount * 0.18 // 18% GST
  }

  const calculateGrandTotal = () => {
    const subtotal = calculateTotal()
    const tax = calculateTax(subtotal)
    return subtotal + tax
  }

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
        <Box>
          <Button
            variant="outlined"
            startIcon={<Payment />}
            onClick={() => setOpenPaymentDialog(true)}
            sx={{ mr: 1 }}
          >
            Process Payment
          </Button>
          <Button
            variant="contained"
            startIcon={<Receipt />}
            onClick={() => setOpenReceiptDialog(true)}
          >
            Generate Receipt
          </Button>
        </Box>

      {/* Main Content Area */}
      <Box className="billing-content">
        {/* Top Row - Billing Summary and Daily Collection */}
        <Box className="billing-summary-row">
          {/* Billing Summary */}
          <Box className="billing-summary-card">
            <Card>
              <CardContent>
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
                  <Divider />
                  <ListItem disablePadding>
                    <ListItemText primary="Subtotal" />
                    <ListItemSecondaryAction>
                      <Typography variant="body2" fontWeight="bold">
                        ₹{calculateTotal()}
                      </Typography>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemText primary="Tax (18%)" />
                    <ListItemSecondaryAction>
                      <Typography variant="body2" fontWeight="bold">
                        ₹{calculateTax(calculateTotal())}
                      </Typography>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                  <ListItem disablePadding>
                    <ListItemText primary="Total" />
                    <ListItemSecondaryAction>
                      <Typography variant="h6" color="primary" fontWeight="bold">
                        ₹{calculateGrandTotal()}
                      </Typography>
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Box>

          {/* Daily Collection */}
          <Box className="daily-collection-card">
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Daily Collection Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={3}>
                    <Box textAlign="center" p={2} bgcolor="primary.light" borderRadius={1}>
                      <Typography variant="h4" color="primary.contrastText">
                        ₹15,420
                      </Typography>
                      <Typography variant="body2" color="primary.contrastText">
                        Today's Collection
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Box textAlign="center" p={2} bgcolor="success.light" borderRadius={1}>
                      <Typography variant="h4" color="success.contrastText">
                        23
                      </Typography>
                      <Typography variant="body2" color="success.contrastText">
                        Bills Processed
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Box textAlign="center" p={2} bgcolor="warning.light" borderRadius={1}>
                      <Typography variant="h4" color="warning.contrastText">
                        5
                      </Typography>
                      <Typography variant="body2" color="warning.contrastText">
                        Pending Bills
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Box textAlign="center" p={2} bgcolor="info.light" borderRadius={1}>
                      <Typography variant="h4" color="info.contrastText">
                        ₹670
                      </Typography>
                      <Typography variant="body2" color="info.contrastText">
                        Average Bill
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Bottom Row - Pending Bills Table */}
        <Box className="billing-table-row">
          <Box className="table-scroll-container">
            <Box className="table-scroll-header">
              <Typography className="table-scroll-title">Pending Bills</Typography>
              <Box className="table-scroll-actions">
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
              </Box>
            </Box>
            
            <Box className="table-scroll-content">
              <Box className="table-search-bar">
                <TextField
                  className="table-search-input"
                  placeholder="Search bills..."
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
                <FormControl size="small" className="table-filter-select">
                  <InputLabel>Status</InputLabel>
                  <Select label="Status">
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="paid">Paid</MenuItem>
                    <MenuItem value="overdue">Overdue</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              <Box className="table-scroll-wrapper">
                <table className="table-scroll-table">
                  <thead className="table-scroll-thead">
                    <tr>
                      <th className="table-scroll-th">Visit ID</th>
                      <th className="table-scroll-th">Patient</th>
                      <th className="table-scroll-th">Amount</th>
                      <th className="table-scroll-th">Status</th>
                      <th className="table-scroll-th table-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="table-scroll-tbody">
                    {mockVisits.map((visit) => (
                      <tr key={visit.visitId} className="table-scroll-tr">
                        <td className="table-scroll-td">{visit.visitId}</td>
                        <td className="table-scroll-td">{visit.patientName}</td>
                        <td className="table-scroll-td">₹{visit.amount.toLocaleString()}</td>
                        <td className="table-scroll-td">
                          <Chip
                            label={visit.status}
                            color={getStatusColor(visit.status) as any}
                            size="small"
                          />
                        </td>
                        <td className="table-scroll-td table-cell-actions">
                          <Button className="table-action-btn" size="small">
                            <Visibility />
                          </Button>
                          <Button className="table-action-btn" size="small">
                            <Edit />
                          </Button>
                          <Button className="table-action-btn" size="small">
                            <Print />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
              
              <Box className="table-pagination">
                <Typography className="table-pagination-info">
                  Showing 1-10 of 25 bills
                </Typography>
                <Box className="table-pagination-controls">
                  <Button className="table-pagination-btn" size="small">Previous</Button>
                  <Button className="table-pagination-btn" size="small">Next</Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Payment Dialog */}
      <Dialog open={openPaymentDialog} onClose={() => setOpenPaymentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Process Payment</DialogTitle>
        <form onSubmit={handlePaymentSubmit(handleProcessPayment)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="visitId"
                  control={paymentControl}
                  rules={{ required: 'Visit ID is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Visit ID"
                      placeholder="Enter visit ID"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="patientId"
                  control={paymentControl}
                  rules={{ required: 'Patient ID is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Patient ID"
                      placeholder="Enter patient ID"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="amount"
                  control={paymentControl}
                  rules={{ required: 'Amount is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Amount"
                      type="number"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="paymentMode"
                  control={paymentControl}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Payment Mode</InputLabel>
                      <Select {...field} label="Payment Mode">
                        <MenuItem value="cash">Cash</MenuItem>
                        <MenuItem value="card">Card</MenuItem>
                        <MenuItem value="upi">UPI</MenuItem>
                        <MenuItem value="netbanking">Net Banking</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="paymentReference"
                  control={paymentControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Payment Reference"
                      placeholder="Transaction ID, UPI reference, etc."
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="notes"
                  control={paymentControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Notes"
                      multiline
                      rows={2}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenPaymentDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Process Payment'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={openReceiptDialog} onClose={() => setOpenReceiptDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Receipt</DialogTitle>
        <form onSubmit={handleReceiptSubmit(handleGenerateReceipt)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="visitId"
                  control={receiptControl}
                  rules={{ required: 'Visit ID is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Visit ID"
                      placeholder="Enter visit ID"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="patientId"
                  control={receiptControl}
                  rules={{ required: 'Patient ID is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Patient ID"
                      placeholder="Enter patient ID"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="totalAmount"
                  control={receiptControl}
                  rules={{ required: 'Total amount is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Total Amount"
                      type="number"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="paidAmount"
                  control={receiptControl}
                  rules={{ required: 'Paid amount is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Paid Amount"
                      type="number"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="discountAmount"
                  control={receiptControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Discount Amount"
                      type="number"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="taxAmount"
                  control={receiptControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Tax Amount"
                      type="number"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="paymentMode"
                  control={receiptControl}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Payment Mode</InputLabel>
                      <Select {...field} label="Payment Mode">
                        <MenuItem value="cash">Cash</MenuItem>
                        <MenuItem value="card">Card</MenuItem>
                        <MenuItem value="upi">UPI</MenuItem>
                        <MenuItem value="netbanking">Net Banking</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="receiptNumber"
                  control={receiptControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Receipt Number"
                      placeholder="Auto-generated if empty"
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenReceiptDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Generate Receipt'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}
