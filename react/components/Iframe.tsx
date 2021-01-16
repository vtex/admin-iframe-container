import React, { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { useRuntime } from 'vtex.render-runtime'
import { cn } from '@vtex/admin-ui'

import { stopLoading, startLoading, getEnv } from '../util'

interface Props {
  isDeloreanAdmin?: boolean
  params?: {
    slug?: string
  }
  customHeightGap?: string | number
}

export function Iframe(props: Props) {
  const { isDeloreanAdmin, params, customHeightGap = '3em' } = props
  const {
    culture: { locale },
    // @ts-expect-error emitter is not available on type, but exists on RenderContext
    emitter,
  } = useRuntime()

  const [loaded, setLoaded] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const src = useRef<string>('')
  const mounted = useRef<boolean>()

  const updateChildLocale = useCallback(() => {
    const message = { action: { type: 'LOCALE_SELECTED', locale } }

    iframeRef?.current?.contentWindow?.postMessage(message, '*')
  }, [locale])

  const updateIframeHistory = useCallback(() => {
    const { pathname, search, hash } = window.location
    const {
      pathname: iframePathname = '',
      search: iframeSearch = '',
      hash: iframeHash = '',
    } = iframeRef?.current?.contentWindow?.location ?? {
      pathname: '',
      search: '',
      hash: '',
    }

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

      iframeRef?.current?.contentWindow?.location.replace(
        newPath.replace(/\/+/g, '/')
      )
    }
  }, [isDeloreanAdmin])

  const updateBrowserHistory = (location: Location) => {
    const {
      pathname: iframePathname,
      search: iframeSearch,
      hash: iframeHash,
    } = location

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

  const handleIframeNavigation = () => {
    updateBrowserHistory(
      iframeRef?.current?.contentWindow?.location ??
        ({
          pathname: '',
          search: '',
          hash: '',
        } as Location)
    )
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

    return `/admin/${props.isDeloreanAdmin ? 'iframe' : 'app'}/${
      props?.params?.slug ?? ''
    }${patchedSearch || ''}${hash || ''}`
  }, [loaded, props])

  const handleOnLoad = () => {
    stopLoading()

    if (!iframeRef.current) return

    updateChildLocale()

    iframeRef.current.contentWindow?.addEventListener(
      'hashchange',
      handleIframeNavigation
    )
    iframeRef.current.contentWindow?.addEventListener(
      'querychange',
      handleIframeNavigation
    )
    iframeRef.current.contentWindow?.addEventListener(
      'popstate',
      handleIframeNavigation
    )

    const iframeHistory = iframeRef.current.contentWindow?.history

    if (
      iframeHistory &&
      // @ts-expect-error originalPushState is not defined
      iframeHistory.pushState !== iframeHistory.originalPushState
    ) {
      // @ts-expect-error originalPushState is not defined
      iframeHistory.originalPushState = iframeHistory.pushState
      // eslint-disable-next-line func-names
      iframeHistory.pushState = function () {
        const result = ((iframeHistory as unknown) as {
          originalPushState: () => void
        }).originalPushState.apply(
          iframeHistory,
          // eslint-disable-next-line prefer-rest-params
          arguments
        )

        handleIframeNavigation()

        return result
      }
    }

    handleIframeNavigation()
  }

  useLayoutEffect(
    function mount() {
      if (!mounted.current) {
        startLoading()
        emitter.on('localesChanged', updateChildLocale)
        setLoaded(true)
        window.addEventListener('popstate', updateIframeHistory)
        mounted.current = true
      } else {
        const nextSrc = buildSrc()

        if (
          isDeloreanAdmin ||
          !(iframeRef?.current?.contentWindow?.location.pathname === nextSrc)
        ) {
          iframeRef?.current?.contentWindow?.location.replace(nextSrc)
        }
      }

      return () => {
        emitter.off('localesChanged', updateChildLocale)
        window.removeEventListener('popstate', updateIframeHistory)
      }
    },
    [buildSrc, emitter, isDeloreanAdmin, updateChildLocale, updateIframeHistory]
  )

  if (params?.slug?.startsWith(isDeloreanAdmin ? 'iframe/' : 'app/')) {
    return null
  }

  // if we update the iframe src, the iframe redirects to the src address and it automatically propagates this navigation to
  // the browser history (this is the expected behaviour https://trillworks.com/nick/2014/06/11/changing-the-src-attribute-of-an-iframe-modifies-the-history/)
  // so we only want to set the iframe src when it has been created in order to start on the URL that has been inserted in the browser in the first navigation.
  // the navigation from outside into the iframe is made by `componentDidUpdate` changing the window location, this doesnt affect the browser history.
  if (src.current === '') {
    src.current = buildSrc()
  }

  return loaded ? (
    <iframe
      title="admin iframe"
      frameBorder="0"
      className={cn({
        width: 'full',
        overflowY: 'scroll',
        // Admin V3's header height is 48px (3em), while the following version's
        // header (Admin V4) is 56px (3.5em), and has a global alert that's displayed
        // on top of the header and has different heights depending on the
        // viewport. The customHeightGap prop is used here to fit the iframe
        // within the app in a flexible enough fashion, which allows to cover
        // multiple use cases from within the apps that use this app.
        height: `calc(100vh - ${customHeightGap})`,
      })}
      src={src.current}
      ref={iframeRef}
      onLoad={handleOnLoad}
      data-hj-suppress
    />
  ) : null
}
