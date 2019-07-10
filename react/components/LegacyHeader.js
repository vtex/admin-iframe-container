import React, { Component } from 'react'
import { path } from 'ramda'
import PropTypes from 'prop-types'
import { injectIntl, intlShape } from 'react-intl'
import { Tabs, Tab, PageHeader } from 'vtex.styleguide'
import { getLegacyHeaderTabs } from './IframeUtils'

class LegacyHeader extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    search: PropTypes.string
  }

  static contextTypes = {
    account: PropTypes.string,
    culture: PropTypes.object,
    emitter: PropTypes.object,
    navigate: PropTypes.func,
  }

  render() {
    const { search, intl } = this.props
    const { navigate } = this.context
    const pathName = path(['location', 'pathname'], window)
    const { tabs, title } = getLegacyHeaderTabs(pathName)

    return (
      <div id="legacyHeader">
        {
          search
          ? <PageHeader
            linkLabel={
              intl.formatMessage({ id: 'appframe.navigation.legacyHeader.back' })
            }
            linkClick={() => {
              window.history.back()
              setTimeout(() => window.location.reload(), 10)
            }}
            title={intl.formatMessage({ id: title })} />
          : <PageHeader title={intl.formatMessage({ id: title })} />
        }
        {
          tabs && tabs.length > 0
          ? (
            <div className="mv3 mh7 nowrap">
              <Tabs>
                {
                  tabs.map((tab, index) => {
                    return (
                      <Tab
                        key={index}
                        onClick={() => navigate({
                          to: tab.path,
                        })}
                        active={tab.active}
                        label={intl.formatMessage({ id:
                          tab.label
                        })} />
                    )
                  })
                }
              </Tabs>
            </div>
          )
          : null
        }
      </div>
    )
  }
}

export default injectIntl(LegacyHeader)
