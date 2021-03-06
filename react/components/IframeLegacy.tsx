import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Box, useSystem, Skeleton } from '@vtex/admin-ui'
import { useRuntime } from 'vtex.render-runtime'

import { LegacyHeader } from './LegacyHeader'
import { getEnv, checkPricingVersion } from '../util'
import { useLoading } from '../hooks'

interface Props {
  params?: {
    slug?: string
  }
}

const minHeight = 700
const compensation = 42

export function IframeLegacy(props: Props) {
  const {
    account,
    workspace,
    culture: { locale },
    // @ts-expect-error emitter is not available on type, but exists on RenderContext
    emitter,
  } = useRuntime()

  const { cn } = useSystem()
  const { startLoading, stopLoading } = useLoading()
  const [height, setHeight] = useState(minHeight)
  const [loaded, setLoaded] = useState(false)

  const iframeRef = useRef<HTMLIFrameElement>(null)

  const updateChildLocale = (payload: unknown) => {
    const message = { action: { type: 'LOCALE_SELECTED', payload } }

    iframeRef?.current?.contentWindow?.postMessage(message, '*')
  }

  const handleOnLoad = () => {
    stopLoading()

    if (!iframeRef.current) return

    updateChildLocale(locale)

    const message = {
      type: 'admin.parent.hostname',
      hostname: window.location.hostname,
    }

    iframeRef?.current?.contentWindow?.postMessage(message, '*')
  }

  const updateBrowserHistory = useCallback(
    (params: { pathname: string; search: string; hash: string }) => {
      const {
        pathname: iframePathname,
        search: iframeSearch,
        hash: iframeHash,
      } = params

      const { pathname, search = '', hash = '' } = window.location
      const patchedIframeSearch = iframeSearch.replace(/(\?|&)env=beta/, '')

      if (
        iframePathname.replace('/iframe', '') !== pathname ||
        search !== patchedIframeSearch ||
        hash !== iframeHash
      ) {
        // @ts-expect-error browser error should be here
        global.browserHistory.push(
          `${iframePathname}${patchedIframeSearch}${iframeHash}`
        )
      }
    },
    []
  )

  const handleIframeMessage = React.useCallback(
    event => {
      event.preventDefault()

      if (!event.data || !event.data.type) return

      const { type } = event.data

      if (type === 'admin.updateContentHeight') {
        const value = event.data.height

        if (Math.abs(height - value) > compensation) {
          setHeight(value)
        }
      }

      if (type === 'admin.navigation') {
        if (window) window.scrollTo(0, 0)
        updateBrowserHistory(event.data)
      }
    },
    [height, updateBrowserHistory]
  )

  const handlePopState = () => {
    setLoaded(true)
  }

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
    const host = `${account}.vtexcommerce${
      env === 'beta' ? 'beta' : 'stable'
    }.com.br/admin/`

    const source = `${props?.params?.slug}${patchedSearch}${hash}`

    return `https://${environment}${host}${source}`
  }, [account, env, hash, patchedSearch, props?.params?.slug, workspace])

  return (
    <Box
      csx={{
        overflow: 'scroll',
      }}
    >
      <LegacyHeader hasBackLink={false} />
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
          csx={{
            width: 'full',
            height: minHeight,
          }}
        />
      )}
    </Box>
  )
}
