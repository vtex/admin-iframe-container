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

      this.iframe.contentWindow.addEventListener(
        'hashchange',
        this.handleIframeNavigation
      )
      this.iframe.contentWindow.addEventListener(
        'querychange',
        this.handleIframeNavigation
      )
      this.iframe.contentWindow.addEventListener(
        'popstate',
        this.handleIframeNavigation
      )
      const iframeHistory = this.iframe.contentWindow.history
      const handleIframeNavigation = this.handleIframeNavigation
      if (
        iframeHistory &&
        iframeHistory.pushState !== iframeHistory.originalPushState
      ) {
        iframeHistory.originalPushState = iframeHistory.pushState
        iframeHistory.pushState = function () {
          const result = iframeHistory.originalPushState.apply(
            iframeHistory,
            arguments
          )
          handleIframeNavigation()
          return result
        }
      }
      this.updateBrowserHistory(this.iframe.contentWindow.location)
    }
  }

  updateIframeHistory = (e) => {
    const { isDeloreanAdmin } = this.props
    const { pathname, search, hash } = window.location
    const {
      pathname: iframePathname,
      search: iframeSearch = '',
      hash: iframeHash = '',
    } = this.iframe.contentWindow.location

    const patchedIframeSearch = iframeSearch.replace(/(\?|\&)env\=beta/, '')

    if (
      iframePathname.replace(isDeloreanAdmin ? '/iframe' : '/app', '') !==
        pathname ||
      search !== patchedIframeSearch ||
      hash !== iframeHash
    ) {
      const newPath = `${pathname.replace(
        '/admin',
        isDeloreanAdmin ? '/admin/iframe' : '/admin/app'
      )}${search}${hash}`

      this.iframe.contentWindow.location.replace(newPath.replace(/\/+/g, '/'))
    }
  }

  updateBrowserHistory = ({
    pathname: iframePathname,
    search: iframeSearch,
    hash: iframeHash,
  }) => {
    const { isDeloreanAdmin } = this.props
    const { pathname, search = '', hash = '' } = window.location

    const patchedIframeSearch = iframeSearch.replace(/(\?|\&)env\=beta/, '')

    let formatedIframePathname = iframePathname.replace(
      isDeloreanAdmin ? '/iframe' : '/app',
      ''
    )

    const formatedPathname = !pathname.endsWith('/') ? `${pathname}/` : pathname
    formatedIframePathname = !formatedIframePathname.endsWith('/')
      ? `${formatedIframePathname}/`
      : formatedIframePathname

    if (
      formatedIframePathname !== formatedPathname ||
      decodeURIComponent(search) !== decodeURIComponent(patchedIframeSearch) ||
      decodeURIComponent(hash) !== decodeURIComponent(iframeHash)
    ) {
      const newPath = `${formatedIframePathname}${patchedIframeSearch}${iframeHash}`

      // here we use replaceState because the iframe navigation already pushed its url to the browser history, so we only need to
      // change the current browser url
      window.history.replaceState({}, '', newPath)
    }
  }

  buildSrc(props) {
    const { loaded } = this.state
    const hash = loaded ? window.location.hash : ''
    const search = loaded ? window.location.search || '' : ''
    const env = getEnv()
    const patchedSearch =
      env !== 'beta'
        ? search
        : search === ''
        ? '?env=beta'
        : search.includes('env=beta')
        ? search
        : search + '&env=beta'
    return `/admin/${props.isDeloreanAdmin ? 'iframe' : 'app'}/${
      props.params.slug || ''
    }${patchedSearch || ''}${hash || ''}`
  }

  componentDidUpdate() {
    const nextSrc = this.buildSrc(this.props)
    if (
      this.props.isDeloreanAdmin ||
      !(this.iframe && this.iframe.contentWindow.location.pathname === nextSrc)
    ) {
      this.iframe && this.iframe.contentWindow.location.replace(nextSrc)
    }
  }

  fixedSrc = ''

  render() {
    const {
      isDeloreanAdmin,
      params: { slug = '' },
    } = this.props
    if (startsWith(isDeloreanAdmin ? 'iframe/' : 'app/', slug)) {
      return
    }
    const { loaded } = this.state
    const { customHeightGap } = this.props
    const style = {
      width: '100%',
      overflowY: 'scroll',
      // Admin V3's header height is 48px (3em), while the following version's
      // header (Admin V4) is 56px (3.5em), and has a global alert that's displayed
      // on top of the header and has different heights depending on the
      // viewport. The customHeightGap prop is used here to fit the iframe
      // within the app in a flexible enough fashion, which allows to cover
      // multiple use cases from within the apps that use this app.
      height: `calc(100vh - ${customHeightGap ? customHeightGap : '3em'})`,
    }

    // if we update the iframe src, the iframe redirects to the src address and it automatically propagates this navigation to
    // the browser history (this is the expected behaviour https://trillworks.com/nick/2014/06/11/changing-the-src-attribute-of-an-iframe-modifies-the-history/)
    // so we only want to set the iframe src when it has been created in order to start on the URL that has been inserted in the browser in the first navigation.
    // the navigation from outside into the iframe is made by `componentDidUpdate` changing the window location, this doesnt affect the browser history.
    if (this.fixedSrc === '') {
      this.fixedSrc = this.buildSrc(this.props)
    }
    const src = this.fixedSrc
    return loaded ? (
      <iframe
        frameBorder="0"
        style={style}
        src={src}
        ref={this.handleRef}
        onLoad={this.handleOnLoad}
        data-hj-suppress
        data-testid="admin-frame-container"
      />
    ) : null
  }
}

export default Iframe
