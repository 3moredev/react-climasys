import { useState, useEffect, useCallback } from 'react'
import { sessionService, SessionInfo } from '../../services/sessionService'

export const useSession = () => {
  const [sessionData, setSessionData] = useState<SessionInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isValid, setIsValid] = useState(false)

  const fetchSessionInfo = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await sessionService.getSessionInfo()

      if (result.success && result.data) {
        setSessionData(result.data)
        setIsValid(true)
        setError(null)
      } else {
        setError(result.error || 'Session not found')
        setIsValid(false)
        setSessionData(null)
      }
    } catch (error) {
      console.error('Session fetch error:', error)
      setError('Connection error')
      setIsValid(false)
      setSessionData(null)
    } finally {
      setIsLoading(false)
    }
  }, [])



  const logout = useCallback(async () => {
    try {
      const success = await sessionService.logout()
      if (success) {
        setSessionData(null)
        setIsValid(false)
        setError(null)
      }
      return success
    } catch (error) {
      console.error('Logout error:', error)
      return false
    }
  }, [])

  const refreshSession = useCallback(() => {
    fetchSessionInfo()
  }, [fetchSessionInfo])

  // Auto-fetch session info on mount
  useEffect(() => {
    fetchSessionInfo()
  }, [fetchSessionInfo])

  // Auto-validate session every 5 minutes to reduce conflicts


  return {
    // Session data
    sessionData,
    username: sessionData?.firstName || sessionData?.loginId || null,
    loginId: sessionData?.loginId,
    firstName: sessionData?.firstName,
    doctorId: sessionData?.doctorId,
    doctorName: sessionData?.doctorName,
    clinicId: sessionData?.clinicId,
    clinicName: sessionData?.clinicName,
    userId: sessionData?.userId,
    languageId: sessionData?.languageId,

    // Session state
    isLoading,
    error,
    isValid,

    // Session methods
    refreshSession,

    logout,
  }
}
