import React from 'react'
import { useNavigate } from 'react-router-dom'
import AddPatientPage from './AddPatientPage'

export default function QuickRegistration() {
  const navigate = useNavigate()

  return (
    <AddPatientPage
      open={true}
      onClose={() => navigate(-1)}
      onSave={() => navigate('/appointment')}
    />
  )
}
