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
    children: PropTypes.node,
  }

  render() {
    const { params } = this.props

    const slug = params && params.slug || ''

    if (isLegacy(slug)) {
      // IframeLegacy and isLegacy are covering Catalog and Legacy CMS admins
      // those are the old portal9 admins served by portal in vtexcommercestable
      return <IframeLegacy params={params} />
    } else if (isDeloreanAdmin(slug)) {
      // this is covering "Legacy" admins versioned by Delorean
      // those were rendered by concierge, but now render delivers them as statics
      return <Iframe params={params} isDeloreanAdmin />
    } else {
      // this covers the rest of cases, which are IO apps that are admins
      // with "/admin/app" routes and fallback to 404 slugs
      return <Iframe params={params} />
    }
  }
}
