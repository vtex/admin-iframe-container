import PropTypes from 'prop-types'
import { startsWith, equals } from 'ramda'
import React, { Component } from 'react'

import { DELOREAN_REGISTRY } from './IframeUtils'
import IframeLegacy from './IframeLegacy'
import Iframe from './Iframe'

const isLegacy = slug => startsWith('Site/', slug) || equals('a', slug) || startsWith('site/', slug)
const isDeloreanAdmin = slug => DELOREAN_REGISTRY.some(path => slug.startsWith(path))

export default class IframeContainer extends Component {
  static propTypes = {
    params: PropTypes.object,
    withoutLegacy: PropTypes.bool,
    children: PropTypes.node,
    customHeightGap: PropTypes.string
  }

  render() {
    const { params, withoutLegacy, customHeightGap } = this.props

    const slug = params && params.slug || ''

    if (withoutLegacy) {
      // Cover just IO apps, ignore legacy apps.
      return <Iframe params={params} customHeightGap={customHeightGap} />
    }

    if (isLegacy(slug)) {
      // IframeLegacy and isLegacy are covering Catalog and Legacy CMS admins
      // those are the old portal9 admins served by portal in vtexcommercestable
      return <IframeLegacy params={params} customHeightGap={customHeightGap} />
    } else if (isDeloreanAdmin(slug)) {
      // This is covering "Legacy" admins versioned by Delorean
      // those were rendered by concierge, but now render delivers them as statics
      return <Iframe params={params} isDeloreanAdmin />
    } else {
      // This covers the rest of cases, which are IO apps that are admins
      // with "/admin/app" routes and fallback to 404 slugs
      // The customHeightGap is only used on the Admin V4 (see vtex/admin)
      return <Iframe params={params} customHeightGap={customHeightGap} />
    }
  }
}
