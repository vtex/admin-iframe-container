import axios from 'axios'

export function isPricingV2Active() {
  return window?.localStorage?.getItem('routePriceSheetFromS3') ?? null
}

export async function checkPricingVersion() {
  // isPricingV2Active oneOf[true,false,null]
  // true => pricing v2 (hide the sku price table)
  // false => pricing v1 (should have sku price table on legacy tabs)
  // null => request failed or localStorage is empty
  if (!isPricingV2Active() !== null) return

  const res = await axios('/api/pricing/pvt/api-configuration')

  const isActive = res.data?.routePriceSheetFromS3 ?? ''

  localStorage.setItem('routePriceSheetFromS3', isActive as string)
}
