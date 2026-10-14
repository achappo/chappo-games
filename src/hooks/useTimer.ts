import { useCallback, useEffect, useState } from 'react'

export function useTimer(running: boolean, initialSeconds = 0) {
  const [seconds, setSeconds] = useState(initialSeconds)

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => {
      setSeconds((s) => s + 1)
    }, 1000)
    return () => window.clearInterval(id)
  }, [running])

  const reset = useCallback((value = 0) => {
    setSeconds(value)
  }, [])

  return { seconds, reset }
}
