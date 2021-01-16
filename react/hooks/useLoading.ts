import { useCallback } from 'react'

export function useLoading() {
  const startLoading = useCallback(
    () => window.postMessage({ action: { type: 'START_LOADING' } }, '*'),
    []
  )

  const stopLoading = useCallback(
    () => window.postMessage({ action: { type: 'STOP_LOADING' } }, '*'),
    []
  )

  return {
    startLoading,
    stopLoading,
  }
}
