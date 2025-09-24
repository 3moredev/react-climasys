import React, { ReactNode } from 'react'
import '../Layout/PageTemplate.css'

interface PageTemplateProps {
  title: string
  children: ReactNode
  headerActions?: ReactNode
  searchFilter?: ReactNode
  showSearchFilter?: boolean
  className?: string
}

export default function PageTemplate({
  title,
  children,
  headerActions,
  searchFilter,
  showSearchFilter = true,
  className = ''
}: PageTemplateProps) {
  return (
    <div className={`page-container ${className}`}>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">{title}</h1>
          {headerActions && (
            <div className="page-actions">
              {headerActions}
            </div>
          )}
        </div>
      </div>

      {/* Search and Filter Section */}
      {showSearchFilter && (
        <div className="search-filter-section">
          {searchFilter || (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
              <input
                type="text"
                placeholder="Search..."
                className="search-input"
              />
              <select className="filter-select">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <button className="action-button primary">
                <span>+</span>
                Add New
              </button>
            </div>
          )}
        </div>
      )}

      {/* Content Area */}
      <div className="content-area">
        {children}
      </div>
    </div>
  )
}
