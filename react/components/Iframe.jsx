import React, { useEffect, useState, useRef, useCallback, memo } from 'react'
import PropTypes from 'prop-types'
import { useRuntime } from 'vtex.render-runtime'
import { cn } from '@vtex/admin-ui'

import { getEnv } from './IframeUtils'
import { useLoading } from '../hooks/useLoading'
import { useForceUpdate } from '../hooks/useForceUpdate'

function Iframe(props) {
  const {
    isDeloreanAdmin,
    params: { slug = '' },
    customHeightGap,
  } = props

  const [loaded, setLoaded] = useState(false)
  const iframeRef = useRef(null)
  const { startLoading, stopLoading } = useLoading()
  const { emitter, culture } = useRuntime()
  const forceUpdate = useForceUpdate()

  useEffect(
    function mount() {
      startLoading()
      emitter.on('localesChanged', updateChildLocale)
      setLoaded(true)
      window.addEventListener('popstate', updateIframeHistory)
      if (typeof forceUpdate === 'function') {
        forceUpdate()
      }

      return () => {
        window.removeEventListener('popstate', updateIframeHistory)
        emitter.off('localesChanged', updateChildLocale)
      }
    },
    [emitter, startLoading, updateIframeHistory, forceUpdate]
  )

  const updateChildLocale = payload => {
    const message = { action: { type: 'LOCALE_SELECTED', payload } }

    iframeRef.current.contentWindow.postMessage(message, '*')
  }

  const handleIframeNavigation = () => {
    updateBrowserHistory(iframeRef.current.contentWindow.location)
  }

  const handleOnLoad = () => {
    stopLoading()

    const iframe = iframeRef.current

    if (!iframe) return

    updateChildLocale(culture.locale)

    iframe.contentWindow.addEventListener('hashchange', handleIframeNavigation)
    iframe.contentWindow.addEventListener('querychange', handleIframeNavigation)
    iframe.contentWindow.addEventListener('popstate', handleIframeNavigation)
    const iframeHistory = iframe.contentWindow.history

    if (
      iframeHistory &&
      iframeHistory.pushState !== iframeHistory.originalPushState
    ) {
      iframeHistory.originalPushState = iframeHistory.pushState
      iframeHistory.pushState = () => {
        // eslint-disable-next-line prefer-spread
        const result = iframeHistory.originalPushState.apply(
          iframeHistory,
          // eslint-disable-next-line prefer-rest-params
          arguments
        )

        handleIframeNavigation()

        return result
      }
    }

    updateBrowserHistory(iframe.contentWindow.location)
  }

  const updateIframeHistory = useCallback(() => {
    const { pathname, search, hash } = window.location
    const {
      pathname: iframePathname,
      search: iframeSearch = '',
      hash: iframeHash = '',
    } = iframeRef.current.contentWindow.location

    const patchedIframeSearch = iframeSearch.replace(/(\?|&)env=beta/, '')

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

      iframeRef.current.contentWindow.location.replace(
        newPath.replace(/\/+/g, '/')
      )
    }
  }, [isDeloreanAdmin])

  const updateBrowserHistory = ({
    pathname: iframePathname,
    search: iframeSearch,
    hash: iframeHash,
  }) => {
    const { pathname, search = '', hash = '' } = window.location

    const patchedIframeSearch = iframeSearch.replace(/(\?|&)env=beta/, '')

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

  const buildSrc = useCallback(() => {
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
        : `${search}&env=beta`

    return `/admin/${isDeloreanAdmin ? 'iframe' : 'app'}/${slug || ''}${
      patchedSearch || ''
    }${hash || ''}`
  }, [loaded, isDeloreanAdmin, slug])

  useEffect(
    function didUpdate() {
      const nextSrc = buildSrc()

      if (
        isDeloreanAdmin ||
        !(
          iframeRef.current &&
          iframeRef.current.contentWindow.location.pathname === nextSrc
        )
      ) {
        iframeRef.current &&
          iframeRef.current.contentWindow.location.replace(nextSrc)
      }
    },
    [buildSrc, isDeloreanAdmin]
  )

  const [fixedSrc, setFixedSrc] = useState('')

  if (String(slug).startsWith(isDeloreanAdmin ? 'iframe/' : 'app/')) {
    return
  }

  const className = cn({
    width: 'full',
    overflowY: 'scroll',
    // Admin V3's header height is 48px (3em), while the following version's
    // header (Admin V4) is 56px (3.5em), and has a global alert that's displayed
    // on top of the header and has different heights depending on the
    // viewport. The customHeightGap prop is used here to fit the iframe
    // within the app in a flexible enough fashion, which allows to cover
    // multiple use cases from within the apps that use this app.
    height: `calc(100vh - ${customHeightGap || '3em'})`,
  })

  // if we update the iframe src, the iframe redirects to the src address and it automatically propagates this navigation to
  // the browser history (this is the expected behaviour https://trillworks.com/nick/2014/06/11/changing-the-src-attribute-of-an-iframe-modifies-the-history/)
  // so we only want to set the iframe src when it has been created in order to start on the URL that has been inserted in the browser in the first navigation.
  // the navigation from outside into the iframe is made by `componentDidUpdate` changing the window location, this doesnt affect the browser history.
  if (fixedSrc === '') {
    setFixedSrc(buildSrc())
  }

  return loaded ? (
    <iframe
      title="Admin Iframe"
      frameBorder="0"
      className={className}
      src={fixedSrc}
      ref={iframeRef}
      onLoad={handleOnLoad}
      data-hj-suppress
    />
  ) : null
}

Iframe.propTypes = {
  params: PropTypes.object,
  isDeloreanAdmin: PropTypes.bool,
  customHeightGap: PropTypes.string,
}

export default memo(Iframe)
