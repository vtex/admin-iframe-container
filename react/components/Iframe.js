import React, { Component } from 'react'
import { startsWith } from 'ramda'
import {
  stopLoading,
  getEnv,
  componentDidMount,
  componentWillUnmount,
  updateChildLocale,
  handleRef,
  contextTypes,
  propTypes,
} from './IframeUtils'

class Iframe extends Component {
  static contextTypes = contextTypes
  static propTypes = propTypes

  state = {
    loaded: false,
  }

  componentDidMount = () => {
    componentDidMount.call(this)
    window.addEventListener('popstate', this.updateIframeHistory)
  }

  componentWillUnmount() {
    componentWillUnmount.call(this)
    window.removeEventListener('popstate', this.updateIframeHistory)
  }

  handleRef = handleRef.bind(this)

  updateChildLocale = updateChildLocale.bind(this)

  handleIframeNavigation = () => {
    this.updateBrowserHistory(this.iframe.contentWindow.location)
  }

  handleOnLoad = () => {
    stopLoading()

    if (this.iframe) {
      this.updateChildLocale(this.context.culture.locale)

      this.iframe.contentWindow.addEventListener('hashchange', this.handleIframeNavigation)
      this.iframe.contentWindow.addEventListener('querychange', this.handleIframeNavigation)
      this.iframe.contentWindow.addEventListener('popstate', this.handleIframeNavigation)
      const iframeHistory = this.iframe.contentWindow.history
      const handleIframeNavigation = this.handleIframeNavigation
      if (iframeHistory
        && iframeHistory.pushState !== iframeHistory.originalPushState) {
        iframeHistory.originalPushState = iframeHistory.pushState
        iframeHistory.pushState = function() {
          const result = iframeHistory.originalPushState.apply(iframeHistory, arguments)
          handleIframeNavigation()
          return result
        }
      }
      this.updateBrowserHistory(this.iframe.contentWindow.location)
    }
  }

  updateIframeHistory = e => {
    const { isDeloreanAdmin } = this.props
    const { pathname, search, hash } = window.location
    const {
      pathname: iframePathname,
      search: iframeSearch = '',
      hash: iframeHash = '',
    } = this.iframe.contentWindow.location

    const patchedIframeSearch = iframeSearch.replace(/(\?|\&)env\=beta/, '')

    if (iframePathname.replace(isDeloreanAdmin ? '/iframe' : '/app', '') !== pathname
      || (search !== patchedIframeSearch)
      || (hash !== iframeHash)) {

      const newPath = `${
        pathname.replace('/admin', isDeloreanAdmin ? '/admin/iframe' : '/admin/app')
      }${search}${hash}`

      this.forceUpdate()
      this.iframe.contentWindow.location.replace(newPath.replace(/\/+/g, '/'))
    }
  }

  updateBrowserHistory = ({ pathname: iframePathname, search: iframeSearch, hash: iframeHash }) => {
    const { isDeloreanAdmin } = this.props
    const { navigate } = this.context
    const { pathname, search = '', hash = '' } = window.location
    const patchedIframeSearch = iframeSearch.replace(/(\?|\&)env\=beta/, '')

    if (iframePathname.replace(isDeloreanAdmin ? '/iframe' : '/app', '') !== pathname
      || (decodeURIComponent(search) !== decodeURIComponent(patchedIframeSearch))
      || (decodeURIComponent(hash) !== decodeURIComponent(iframeHash))) {

      const newPath = `${
        iframePathname.replace(isDeloreanAdmin ? '/admin/iframe' : '/admin/app', '/admin')
      }${patchedIframeSearch}${iframeHash}`

      navigate({ to: newPath.replace(/\/+/g, '/') })
    }
  }

  buildSrc(props, patchedSearch, hash) {
    return `/admin/${props.isDeloreanAdmin ? 'iframe' : 'app'}/${props.params.slug}${patchedSearch || ''}${hash || ''}`
  }

  shouldComponentUpdate(nextProps) {
    const { loaded } = this.state
    const hash = loaded ? window.location.hash : ''
    const search = loaded ? window.location.search || '' : ''
    const env = getEnv()
    const patchedSearch = env !== 'beta'
      ? search
      : search === ''
        ? '?env=beta'
        : search.includes('env=beta')
          ? search
          : search + '&env=beta'
    const nextSrc = this.buildSrc(nextProps, patchedSearch, hash)

    return nextProps.isDeloreanAdmin || !(this.iframe && this.iframe.contentWindow.location.pathname.startsWith(nextSrc))
  }

  render() {
    const { isDeloreanAdmin, params: { slug = '' } } = this.props
    if (startsWith(isDeloreanAdmin ? 'iframe/' : 'app/', slug)) {
      return
    }
    const { loaded } = this.state
    const { location } = window

    const hash = loaded ? location.hash : ''
    const search = loaded ? location.search || '' : ''
    const env = getEnv()
    const patchedSearch = env !== 'beta'
      ? search
      : search === ''
        ? '?env=beta'
        : search.includes('env=beta')
          ? search
          : search + '&env=beta'

    const src = location.pathname.replace('/admin', isDeloreanAdmin ? '/admin/iframe' : '/admin/app') + patchedSearch + hash

    return loaded ? (
      <iframe
        className="w-100 calc--height overflow-container"
        frameBorder="0"
        src={src}
        ref={this.handleRef}
        onLoad={this.handleOnLoad}
        key={src}
        data-hj-suppress
      />
    ) : null
  }
}

export default Iframe
