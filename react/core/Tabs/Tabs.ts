import type { ReactNode } from 'react'
import type { FlexProps, StyleProp } from '@vtex/admin-ui'
import { jsxs, Flex, merge } from '@vtex/admin-ui'

export function Tabs(props: TabsProps) {
  const tabsProps = useTabs(props)

  return jsxs({
    component: Flex,
    props: tabsProps,
  })
}

export function useTabs(props: TabsProps): FlexProps {
  const { styleOverrides, ...rest } = props

  const theme: StyleProp = {
    height: 52,
  }

  return {
    styles: merge(theme, styleOverrides),
    ...rest,
  }
}

export interface TabsProps {
  children?: ReactNode
  styleOverrides?: StyleProp
}
