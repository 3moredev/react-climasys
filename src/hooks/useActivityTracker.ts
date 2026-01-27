/**
 * Activity Tracker Hook
 * 
 * This hook tracks user activity and updates session persistence
 * to maintain authentication state across page refreshes.
 */

import { useEffect, useCallback } from 'react'
import { sessionPersistence } from '../utils/sessionPersistence'

export const useActivityTracker = () => {
  const updateActivity = useCallback(() => {
    sessionPersistence.updateLastActivity()
  }, [])

  useEffect(() => {
    // List of events that indicate user activity
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'focus',
      'blur'
    ]

    // Throttle activity updates to avoid excessive localStorage writes
    let lastUpdate = 0
    const throttleMs = 30000 // 30 seconds

    const handleActivity = () => {
      const now = Date.now()
      if (now - lastUpdate > throttleMs) {
        // Update local session persistence
        updateActivity()
        
        lastUpdate = now
      }
    }

    // Add event listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true })
    })

    // Initial activity update
    updateActivity()
    
    // Cleanup
    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity)
      })
    }
  }, [updateActivity])

  return {
    updateActivity
  }
}

export default useActivityTracker
