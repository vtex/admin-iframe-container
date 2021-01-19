import Cookies from 'js-cookie'

export function getEnv() {
  return Cookies.get('vtex-commerce-env') ?? 'stable'
}

export function stopLoading() {
  window.postMessage({ action: { type: 'STOP_LOADING' } }, '*')
}

export function startLoading() {
  window.postMessage({ action: { type: 'START_LOADING' } }, '*')
}
