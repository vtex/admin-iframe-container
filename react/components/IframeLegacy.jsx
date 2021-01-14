import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Box, cn, Skeleton } from '@vtex/admin-ui'
import { useRuntime } from 'vtex.render-runtime'

import LegacyHeader from './LegacyHeader'
import { getEnv, propTypes, checkPricingVersion } from './IframeUtils'
import { useLoading } from '../hooks/useLoading'

export default function HookedIframe(props) {
  const {
    account,
    workspace,
    culture: { locale },
    emitter,
  } = useRuntime()

  const { startLoading, stopLoading } = useLoading()
  const [height, setHeight] = useState(700)
  const [loaded, setLoaded] = useState(false)
  const [iframeQuery] = useState('')
  const iframeRef = useRef(null)

  useEffect(
    function init() {
      checkPricingVersion()
      startLoading()
      emitter.on('localesChanged', updateChildLocale)
      setLoaded(true)
      window.addEventListener('message', handleIframeMessage)
      window.addEventListener('popstate', handlePopState)

      return () => {
        window.removeEventListener('message', handleIframeMessage)
        window.removeEventListener('popstate', handlePopState)
        emitter.off('localesChanged', updateChildLocale)
      }
    },
    [emitter, handleIframeMessage, startLoading]
  )

  const updateHeight = useCallback(value => {
    const threshold = 700

    if (value < threshold) {
      setHeight(700)
    } else {
      setHeight(value)
    }
  }, [])

  const updateChildLocale = payload => {
    const message = { action: { type: 'LOCALE_SELECTED', payload } }

    iframeRef.current.contentWindow.postMessage(message, '*')
  }

  const handleOnLoad = () => {
    stopLoading()

    if (!iframeRef.current) return

    updateChildLocale(locale)

    const message = {
      type: 'admin.parent.hostname',
      hostname: window.location.hostname,
    }

    iframeRef.current.contentWindow.postMessage(message, '*')
  }

  const handleIframeMessage = React.useCallback(
    event => {
      event.preventDefault()

      if (!event.data || !event.data.type) return

      const { type } = event.data

      if (type === 'admin.updateContentHeight') updateHeight(event.data.height)
      if (type === 'admin.navigation') {
        if (window) window.scrollTo(0, 0)
        updateBrowserHistory(event.data)
      }
    },
    [updateHeight]
  )

  const updateBrowserHistory = ({
    pathname: iframePathname,
    search: iframeSearch,
    hash: iframeHash,
  }) => {
    const { pathname, search = '', hash = '' } = window.location
    const patchedIframeSearch = iframeSearch.replace(/(\?|&)env=beta/, '')

    if (
      iframePathname.replace('/iframe', '') !== pathname ||
      search !== patchedIframeSearch ||
      hash !== iframeHash
    ) {
      global.browserHistory.push(
        `${iframePathname.replace(
          'admin-proxy',
          'admin'
        )}${patchedIframeSearch}${iframeHash}`
      )
    }
  }

  const handlePopState = () => {
    setLoaded(true)
  }

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

  const src = React.useMemo(() => {
    const isDevWorkspace = workspace && workspace !== 'master'
    const environment = isDevWorkspace ? `${workspace}--` : ''
    const host = `${account}.myvtex.com/admin-proxy/`
    const source = `${props.params.slug}${patchedSearch}${hash}`

    return `https://${environment}${host}${source}`
  }, [account, hash, patchedSearch, props.params.slug, workspace])

  return (
    <Box
      styles={{
        overflow: 'scroll',
      }}
    >
      <LegacyHeader search={iframeQuery} slug={props.slug} />
      {loaded ? (
        <iframe
          title="Legacy iframe container"
          src={src}
          scrolling="no"
          frameBorder="0"
          className={cn({
            width: 'full',
            height: `${height}px !important`,
            overflow: 'scroll',
          })}
          onLoad={handleOnLoad}
          ref={iframeRef}
          seamless
        />
      ) : (
        <Skeleton
          styles={{
            width: 'full',
            height: 700,
          }}
        />
      )}
    </Box>
  )
}

HookedIframe.propTypes = propTypes
