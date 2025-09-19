import React from 'react'
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  InputAdornment,
  Chip,
} from '@mui/material'
import { Search } from '@mui/icons-material'

interface TableColumn {
  key: string
  label: string
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (value: any, row: any) => React.ReactNode
}

interface ScrollableTableProps {
  title: string
  data: any[]
  columns: TableColumn[]
  searchPlaceholder?: string
  filterOptions?: { label: string; value: string }[]
  onSearch?: (value: string) => void
  onFilter?: (value: string) => void
  actions?: React.ReactNode
  pagination?: {
    current: number
    total: number
    pageSize: number
    onPageChange: (page: number) => void
  }
  loading?: boolean
  emptyMessage?: string
}

export default function ScrollableTable({
  title,
  data,
  columns,
  searchPlaceholder = "Search...",
  filterOptions = [],
  onSearch,
  onFilter,
  actions,
  pagination,
  loading = false,
  emptyMessage = "No data available"
}: ScrollableTableProps) {
  const [searchValue, setSearchValue] = React.useState('')
  const [filterValue, setFilterValue] = React.useState('')

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setSearchValue(value)
    onSearch?.(value)
  }

  const handleFilterChange = (event: any) => {
    const value = event.target.value
    setFilterValue(value)
    onFilter?.(value)
  }

  return (
    <Box className="table-scroll-container">
      {/* Header */}
      <Box className="table-scroll-header">
        <Typography className="table-scroll-title">{title}</Typography>
        {actions && (
          <Box className="table-scroll-actions">
            {actions}
          </Box>
        )}
      </Box>
      
      {/* Content */}
      <Box className="table-scroll-content">
        {/* Search and Filter Bar */}
        <Box className="table-search-bar">
          <TextField
            className="table-search-input"
            placeholder={searchPlaceholder}
            size="small"
            value={searchValue}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          {filterOptions.length > 0 && (
            <FormControl size="small" className="table-filter-select">
              <InputLabel>Filter</InputLabel>
              <Select
                label="Filter"
                value={filterValue}
                onChange={handleFilterChange}
              >
                <MenuItem value="">All</MenuItem>
                {filterOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>
        
        {/* Table */}
        <Box className="table-scroll-wrapper">
          {loading ? (
            <Box className="table-loading-overlay">
              <Typography className="table-loading-spinner">Loading...</Typography>
            </Box>
          ) : data.length === 0 ? (
            <Box className="table-empty-state">
              <Typography className="table-empty-icon">📊</Typography>
              <Typography className="table-empty-title">No Data</Typography>
              <Typography className="table-empty-description">{emptyMessage}</Typography>
            </Box>
          ) : (
            <table className="table-scroll-table">
              <thead className="table-scroll-thead">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={`table-scroll-th ${column.align === 'center' ? 'table-center' : ''} ${column.align === 'right' ? 'table-right' : ''}`}
                      style={{ width: column.width }}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="table-scroll-tbody">
                {data.map((row, index) => (
                  <tr key={index} className="table-scroll-tr">
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`table-scroll-td ${column.align === 'center' ? 'table-center' : ''} ${column.align === 'right' ? 'table-right' : ''}`}
                      >
                        {column.render 
                          ? column.render(row[column.key], row)
                          : row[column.key]
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Box>
        
        {/* Pagination */}
        {pagination && (
          <Box className="table-pagination">
            <Typography className="table-pagination-info">
              Showing {((pagination.current - 1) * pagination.pageSize) + 1}-{Math.min(pagination.current * pagination.pageSize, pagination.total)} of {pagination.total} items
            </Typography>
            <Box className="table-pagination-controls">
              <Button
                className="table-pagination-btn"
                size="small"
                disabled={pagination.current === 1}
                onClick={() => pagination.onPageChange(pagination.current - 1)}
              >
                Previous
              </Button>
              <Button
                className="table-pagination-btn"
                size="small"
                disabled={pagination.current * pagination.pageSize >= pagination.total}
                onClick={() => pagination.onPageChange(pagination.current + 1)}
              >
                Next
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  )
}
