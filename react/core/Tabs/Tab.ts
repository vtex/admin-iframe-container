import type { StyleProp, ButtonProps } from '@vtex/admin-ui'
import { jsxs, Button, merge } from '@vtex/admin-ui'

export function Tab(props: TabProps) {
  const tabProps = useTab(props)

  return jsxs({
    component: Button,
    props: tabProps,
  })
}

export function useTab(props: TabProps): ButtonProps {
  const { styleOverrides, active, ...rest } = props

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
    ...activeStyle,
  }

  return {
    styleOverrides: merge(theme, styleOverrides),
    variant: 'adaptative-dark',
    ...rest,
  }
}

export interface TabProps
  extends Pick<ButtonProps, 'children' | 'styleOverrides' | 'onClick'> {
  active?: boolean
}
