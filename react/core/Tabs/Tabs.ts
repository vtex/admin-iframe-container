import type { ReactNode } from 'react'
import type { FlexProps, StyleProp } from '@vtex/admin-ui'
import { createComponent, Flex, merge } from '@vtex/admin-ui'

export const Tabs = createComponent(Flex, useTabs)

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
