import React from 'react'
import { useIntl, FormattedMessage } from 'react-intl'
import { PageHeader } from 'vtex.styleguide'
import { useRuntime } from 'vtex.render-runtime'
import { Box } from '@vtex/admin-ui'

import { Tabs, Tab } from '../core'
import { getLegacyTabs } from '../util'

interface Props {
  search: string
}

export function LegacyHeader(props: Props) {
  const { search } = props
  const { navigate } = useRuntime()
  const { formatMessage } = useIntl()

  const pathName = window?.location?.pathname ?? ''
  const { tabs, title } = getLegacyTabs(pathName)

  return (
    <Box styles={{ marginBottom: 2 }} id="legacyHeader">
      {search ? (
        <PageHeader
          linkLabel={formatMessage({
            id: 'appframe.navigation.legacyHeader.back',
          })}
          linkClick={() => {
            window.history.back()
            setTimeout(() => window.location.reload(), 10)
          }}
          title={formatMessage({ id: title })}
        />
      ) : (
        <PageHeader title={formatMessage({ id: title })} />
      )}
      {tabs && tabs.length > 0 ? (
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
    </Box>
  )
}
