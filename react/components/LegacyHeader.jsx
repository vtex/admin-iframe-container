import React from 'react'
// eslint-disable-next-line no-restricted-imports
import { path } from 'ramda'
import PropTypes from 'prop-types'
import { injectIntl, intlShape } from 'react-intl'
import { Tabs, Tab, PageHeader } from 'vtex.styleguide'
import { useRuntime } from 'vtex.render-runtime'

import { getLegacyHeaderTabs } from './IframeUtils'

function LegacyHeader(props) {
  const { intl, search } = props
  const { navigate } = useRuntime()

  const pathName = path(['location', 'pathname'], window)
  const { tabs, title } = getLegacyHeaderTabs(pathName)

  return (
    <div id="legacyHeader">
      {search ? (
        <PageHeader
          linkLabel={intl.formatMessage({
            id: 'appframe.navigation.legacyHeader.back',
          })}
          linkClick={() => {
            window.history.back()
            setTimeout(() => window.location.reload(), 10)
          }}
          title={intl.formatMessage({ id: title })}
        />
      ) : (
        <PageHeader title={intl.formatMessage({ id: title })} />
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
                  label={intl.formatMessage({ id: tab.label })}
                />
              )
            })}
          </Tabs>
        </div>
      ) : null}
    </div>
  )
}

LegacyHeader.propTypes = {
  intl: intlShape.isRequired,
  search: PropTypes.string,
}

export default injectIntl(LegacyHeader)
