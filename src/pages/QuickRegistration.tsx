import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AddPatientPage from './AddPatientPage'

export default function QuickRegistration() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const patientId = searchParams.get('patientId')

  return (
    <AddPatientPage
      open={true}
      onClose={() => navigate(-1)}
      onSave={() => navigate('/appointment')}
      patientId={patientId || undefined}
      readOnly={!!patientId}
    />
  )
}
