import React from 'react'
import { useIntl } from 'react-intl'
import { Tabs, Tab, PageHeader } from 'vtex.styleguide'
import { useRuntime } from 'vtex.render-runtime'

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
    <div id="legacyHeader">
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
        <div className="mv3 mh7 nowrap">
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
                  label={formatMessage({ id: tab.label })}
                />
              )
            })}
          </Tabs>
        </div>
      ) : null}
    </div>
  )
}
