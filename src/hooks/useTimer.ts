import { useCallback, useEffect, useState } from 'react'

export function useTimer(running: boolean) {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => {
      setSeconds((s) => s + 1)
    }, 1000)
    return () => window.clearInterval(id)
  }, [running])

  const reset = useCallback(() => {
    setSeconds(0)
  }, [])

  return { seconds, reset }
}
