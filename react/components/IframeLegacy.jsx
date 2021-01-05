import React from 'react'
import { Box, cn, Skeleton } from '@vtex/admin-ui'
import { useRuntime } from 'vtex.render-runtime'

import LegacyHeader from './LegacyHeader'
import { getEnv, propTypes, checkPricingVersion } from './IframeUtils'
import { useLoading } from '../hooks/useLoading'

const COMPENSATION = 42

// const getLegacyBaseURL = account =>
//   `https://newadmin--${account}.myvtex.com/admin-proxy/`

export default function HookedIframe(props) {
  const {
    account,
    workspace,
    culture: { locale },
    emitter,
    // navigate,
  } = useRuntime()

  const { startLoading, stopLoading } = useLoading()
  const [loaded, setLoaded] = React.useState(false)
  const [iframeQuery] = React.useState('')
  const iframeRef = React.useRef(null)

  React.useEffect(
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

  const updateChildLocale = payload => {
    const message = { action: { type: 'LOCALE_SELECTED', payload } }

    iframeRef.current.contentWindow.postMessage(message, '*')
  }

  const handleOnLoad = () => {
    stopLoading() // REVIEW

    if (!iframeRef.current) {
      return
    }

    updateChildLocale(locale)

    const message = {
      type: 'admin.parent.hostname',
      hostname: window.location.hostname,
    }

    iframeRef.current.contentWindow.postMessage(message, '*')
  }

  const handleIframeMessage = React.useCallback(event => {
    event.preventDefault()
    if (!event.data || !event.data.type) {
      return
    }

    const { type } = event.data

    // console.debug(
    //   `%c [LEGACY IFRAME] \n Received iframe message with type: ${type}`,
    //   'background: #002833; color: #bada55'
    // )

    if (type === 'admin.updateContentHeight') {
      const iframeHeight = parseInt(
        iframeRef.current.style.height.replace('px', ''),
        10
      )

      const eventHeight = event.data.height

      if (Math.abs(eventHeight - iframeHeight) > COMPENSATION) {
        // This compensation is here to prevent a loop where the height of the content keeps growing
        // this happens due to methods of getting content height, which counts with diferente components
        // on the page such as horizontal scroll bars, which are different sizes depending on the OS
        // more here: http://usefulangle.com/post/65/javascript-automatically-resize-iframe
        iframeRef.current.style.height = `${eventHeight}px`
      }
    } else if (type === 'admin.navigation') {
      // updateBrowserHistory(event.data)
      // reset iframe height on navigate
      iframeRef.current.style.height = '700px'
    } else if (type === 'admin.absoluteNavigation') {
      // const [, newPathName] = event.data.destination.split('/admin-proxy/')
      // const newUrl = `${window.location.origin}/admin/${newPathName}`
      // navigate({
      //   to: newUrl,
      // })
      // window.location.replace(newUrl)
    }
  }, [])

  // const updateBrowserHistory = ({
  //   pathname: iframePathname,
  //   search: iframeSearch,
  //   hash: iframeHash,
  // }) => {
  //   const { pathname, search = '', hash = '' } = window.location
  //   const patchedIframeSearch = iframeSearch.replace(/(\?|&)env=beta/, '')

  //   if (
  //     iframePathname.replace('/iframe', '') !== pathname ||
  //     search !== patchedIframeSearch ||
  //     hash !== iframeHash
  //   ) {
  //     const newPath = `${iframePathname.replace(
  //       '/admin-proxy',
  //       '/admin'
  //     )}${patchedIframeSearch}${iframeHash}`

  //     // navigate({
  //     //   to: newPath.replace(/\/+/g, '/'),
  //     // })
  //     // global.browserHistory.push(newPath.replace(/\/+/g, '/'))
  //   }
  // }

  const handlePopState = () => {
    // console.debug('handleIframeMessage()')
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

  const src = React.useMemo(
    () =>
      `https://${
        workspace ? `${workspace}--` : ''
      }${account}.myvtex.com/admin-proxy/${
        props.params.slug
      }${patchedSearch}${hash}`,
    [account, hash, patchedSearch, props.params.slug, workspace]
  )

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
            height: 700,
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
