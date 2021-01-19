import type { ReactNode } from 'react'
import React from 'react'
import { ThemeProvider } from '@vtex/admin-ui'

import { IframeLegacy } from './IframeLegacy'
import { Iframe } from './Iframe'
import { DELOREAN_REGISTRY } from '../util'

const isLegacy = (slug: string) =>
  String(slug).startsWith('Site/') ||
  String(slug) === 'a' ||
  String(slug).startsWith('site/')

const isDeloreanAdmin = (slug: string) =>
  DELOREAN_REGISTRY.some(path => slug.startsWith(path))

export function IframeContainer(props: Props) {
  const { params, withoutLegacy, customHeightGap } = props

  const slug = params?.slug ?? ''

  if (withoutLegacy) {
    // Cover just IO apps, ignore legacy apps.
    return <Iframe params={params} />
  }

  if (isLegacy(slug)) {
    // IframeLegacy and isLegacy are covering Catalog and Legacy CMS admins
    // those are the old portal9 admins served by portal in vtexcommercestable
    return (
      <ThemeProvider>
        <IframeLegacy params={params} />
      </ThemeProvider>
    )
  }

  if (isDeloreanAdmin(slug)) {
    // This is covering "Legacy" admins versioned by Delorean
    // those were rendered by concierge, but now render delivers them as statics
    return <Iframe params={params} isDeloreanAdmin />
  }

  // This covers the rest of cases, which are IO apps that are admins
  // with "/admin/app" routes and fallback to 404 slugs
  // The customHeightGap is only used on the Admin V4 (see vtex/admin)
  return <Iframe params={params} customHeightGap={customHeightGap} />
}

interface Props {
  params?: {
    slug: string
  }
  withoutLegacy?: boolean
  children?: ReactNode
  customHeightGap?: string | number
}
