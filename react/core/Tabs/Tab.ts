import type { StyleProp, ButtonProps } from '@vtex/admin-ui'
import { createComponent, Button, merge } from '@vtex/admin-ui'

export const Tab = createComponent(Button, useTab)

export function useTab(props: TabProps): ButtonProps {
  const { csx, active, ...rest } = props

  const activeStyle: StyleProp = active
    ? {
        borderBottomColor: 'blue',
        borderBottomWidth: 2,
        borderBottomStyle: 'solid',
        color: 'blue',
      }
    : {}

  const theme: StyleProp = {
    borderRadius: 'none',
    textTransform: 'uppercase',
    display: 'flex',
    height: 'full',
    color: 'dark.secondary',
    fontSettings: 'medium',
    ':hover': {
      bg: 'transparent',
      color: 'blue',
    },
    ':active': {
      bg: 'transparent',
    },
    ...activeStyle,
  }

  return {
    csx: merge(theme, csx),
    variant: 'adaptative-dark',
    ...rest,
  }
}

export interface TabProps
  extends Pick<ButtonProps, 'children' | 'csx' | 'onClick'> {
  active?: boolean
}
