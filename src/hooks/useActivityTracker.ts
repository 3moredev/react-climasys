/**
 * Activity Tracker Hook
 * 
 * This hook tracks user activity and updates session persistence
 * to maintain authentication state across page refreshes.
 * Also calls backend keepalive API to prevent server session timeout.
 */

import { useEffect, useCallback, useRef } from 'react'
import { sessionPersistence } from '../utils/sessionPersistence'
import { sessionService } from '../services/sessionService'

export const useActivityTracker = () => {
  const updateActivity = useCallback(() => {
    sessionPersistence.updateLastActivity()
  }, [])

  // Keep track of last keepalive call
  const lastKeepaliveRef = useRef<number>(0)

  const callKeepalive = useCallback(async () => {
    const now = Date.now()
    const keepaliveThrottleMs = 5 * 60 * 1000 // 5 minutes
    
    // Only call keepalive if enough time has passed
    if (now - lastKeepaliveRef.current > keepaliveThrottleMs) {
      try {
        await sessionService.keepSessionAlive()
        lastKeepaliveRef.current = now
      } catch (error) {
        // Silently handle errors - keepalive failures shouldn't break the app
        console.debug('Keepalive call failed:', error)
      }
    }
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
        
        // Call backend keepalive (throttled to every 5 minutes)
        callKeepalive()
        
        lastUpdate = now
      }
    }

    // Add event listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true })
    })

    // Initial activity update
    updateActivity()
    
    // Initial keepalive call
    callKeepalive()

    // Set up periodic keepalive check (every 5 minutes)
    const keepaliveInterval = setInterval(() => {
      callKeepalive()
    }, 5 * 60 * 1000) // 5 minutes

    // Cleanup
    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity)
      })
      clearInterval(keepaliveInterval)
    }
  }, [updateActivity, callKeepalive])

  return {
    updateActivity
  }
}

export default useActivityTracker
