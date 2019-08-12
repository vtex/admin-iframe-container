import { stopLoading, getEnv, componentDidMount, componentWillUnmount, updateChildLocale, handleRef, contextTypes, propTypes, checkPricingVersion } from './IframeUtils'
import LegacyHeader from './LegacyHeader'
import { injectIntl } from 'react-intl'
import React, { Component } from 'react'

const COMPENSATION = 42

class IframeLegacy extends Component {
  static contextTypes = contextTypes
  static propTypes = propTypes

  state = {
    loaded: false,
    iframeQuery: '',
  }

  handleRef = handleRef.bind(this)

  updateChildLocale = updateChildLocale.bind(this)

  componentDidMount = () => {
    checkPricingVersion()
    componentDidMount.apply(this)
    window.addEventListener('message', this.handleIframeMessage)
    window.addEventListener('popstate', this.handlePopState)
  }

  handlePopState = () => {
    this.setState({loaded: false}, () => {
      this.setState({loaded: true})
    })
  }

  componentWillUnmount = () => {
    componentWillUnmount.apply(this)
    window.removeEventListener('message', this.handleIframeMessage)
    window.removeEventListener('popstate', this.handlePopState)
  }

  handleIframeNavigation = () => {
    this.updateBrowserHistory(this.iframe.contentWindow.location)
  }

  handleIframeMessage = (event) => {
    if (event.data && event.data.type) {
      const type = event.data.type
      console.debug(`%c [LEGACY IFRAME] \n Received iframe message with type: ${type}`, 'background: #002833; color: #bada55')
      if (type === 'admin.updateContentHeight') {
        const iframeHeight = parseInt(this.iframe.style.height.replace('px', ''))
        const eventHeight = event.data.height
        if (Math.abs(eventHeight - iframeHeight) > COMPENSATION) {
          // This compensation is here to prevent a loop where the height of the content keeps growing
          // this happens due to methods of getting content height, which counts with diferente components
          // on the page such as horizontal scroll bars, which are different sizes depending on the OS
          // more here: http://usefulangle.com/post/65/javascript-automatically-resize-iframe
          this.iframe.style.height = `${eventHeight}px`
        }
      } else if (type === 'admin.navigation') {
        this.updateBrowserHistory(event.data)
        // reset iframe height on navigate
        this.iframe.style.height = '700px'
      } else if (type === 'admin.absoluteNavigation') {
        const newPathName = event.data.destination.split('/admin-proxy/')[1]
        const newUrl = `${window.location.origin}/admin/${newPathName}`
        window.location.replace(newUrl)
      }
    }
  }

  handleOnLoad = () => {
    stopLoading()

    if (this.iframe) {
      this.updateChildLocale(this.context.culture.locale)

      const message = { type: 'admin.parent.hostname', hostname: window.location.hostname }
      this.iframe.contentWindow.postMessage(message, '*')
    }
  }

  updateBrowserHistory = ({ pathname: iframePathname, search: iframeSearch, hash: iframeHash }) => {
    const { pathname, search = '', hash = '' } = window.location
    const patchedIframeSearch = iframeSearch.replace(/(\?|\&)env\=beta/, '')

    if (iframePathname.replace('/admin-proxy', '') !== pathname
      || (search !== patchedIframeSearch)
      || (hash !== iframeHash)) {
      const newPath = `${iframePathname.replace('/admin-proxy', '/admin')}${patchedIframeSearch}${iframeHash}`
      global.browserHistory.push(newPath.replace(/\/+/g, '/'))
    }
  }

  render() {
    const { account, navigate } = this.context
    const { intl, params: { slug = '' } } = this.props
    const { loaded, iframeQuery } = this.state
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

    const src = `/admin-proxy/${slug}${patchedSearch}${hash}`

    return loaded ? (
      <div className="w-100 calc--height overflow-container">
        <LegacyHeader search={iframeQuery} slug={slug} />
        <iframe
          style={{ height: 700 }}
          className="w-100"
          scrolling="no"
          frameBorder="0"
          src={src}
          ref={this.handleRef}
          onLoad={this.handleOnLoad}
          data-hj-suppress
        />
      </div>
    ) : null
  }
}

export default injectIntl(IframeLegacy)
