import React, { useState } from 'react'
import PageTemplate from '../components/Layout/PageTemplate'
import { Button, TextField, Select, MenuItem, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'
import { Add, Search, Edit, Delete } from '@mui/icons-material'

// Example data
const sampleData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Inactive' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'Active' },
]

export default function ExampleTemplatePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Header actions
  const headerActions = (
    <Button
      variant="contained"
      startIcon={<Add />}
      className="action-button primary"
    >
      Add New User
    </Button>
  )

  // Search and filter section
  const searchFilter = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
      <TextField
        placeholder="Search users..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-input"
      />
      <Select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="filter-select"
        displayEmpty
      >
        <MenuItem value="">All Status</MenuItem>
        <MenuItem value="Active">Active</MenuItem>
        <MenuItem value="Inactive">Inactive</MenuItem>
      </Select>
      <Button
        variant="outlined"
        startIcon={<Search />}
        className="action-button"
      >
        Search
      </Button>
    </div>
  )

  return (
    <PageTemplate
      title="User Management"
      headerActions={headerActions}
      searchFilter={searchFilter}
    >
      {/* Content Area */}
      <div className="data-table">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sampleData.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <span className={`status-indicator status-${user.status.toLowerCase()}`}></span>
                  {user.status}
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    startIcon={<Edit />}
                    className="btn btn-sm"
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    startIcon={<Delete />}
                    className="btn btn-sm"
                    style={{ marginLeft: '8px' }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Example */}
      <div className="pagination-container">
        <div className="pagination-info">
          <span>Showing 1-3 of 3 results</span>
          <div className="page-size-selector">
            <span>Show:</span>
            <select className="page-size-select">
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
        <div className="pagination-controls">
          <button className="page-btn nav-btn" disabled>Previous</button>
          <button className="page-btn active">1</button>
          <button className="page-btn nav-btn" disabled>Next</button>
        </div>
      </div>
    </PageTemplate>
  )
}
