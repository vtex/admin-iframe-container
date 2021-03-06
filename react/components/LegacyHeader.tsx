import React from 'react'
import { useIntl, FormattedMessage } from 'react-intl'
import { useRuntime } from 'vtex.render-runtime'

import { Tabs, Tab, PageHeader, Navbar } from '../core'
import { getLegacyTabs } from '../util'

interface Props {
  hasBackLink: boolean
}

export function LegacyHeader(props: Props) {
  const { hasBackLink } = props
  const { navigate } = useRuntime()
  const { formatMessage } = useIntl()

  const pathName = window?.location?.pathname ?? ''
  const { tabs, title } = getLegacyTabs(pathName)
  const withTabs = tabs && tabs.length > 0

  return (
    <PageHeader id="legacyHeader" size={withTabs ? 'large' : 'regular'}>
      <Navbar
        title={formatMessage({ id: title })}
        link={
          hasBackLink
            ? {
                label: formatMessage({
                  id: 'appframe.navigation.legacyHeader.back',
                }),
                onClick: () => {
                  window.history.back()
                  // setTimeout(() => window.location.reload(), 10)
                },
              }
            : undefined
        }
      />
      {withTabs ? (
        <Tabs>
          {tabs.map((tab, index) => {
            return (
              <Tab
                key={index}
                onClick={() =>
                  navigate({
                    to: tab.path,
                  })
                }
                active={tab.active}
              >
                <FormattedMessage id={tab.label} />
              </Tab>
            )
          })}
        </Tabs>
      ) : null}
    </PageHeader>
  )
}
