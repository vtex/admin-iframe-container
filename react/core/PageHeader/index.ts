import type { ReactNode } from 'react'
import type { FlexProps, StyleProp } from '@vtex/admin-ui'
import { createComponent, Flex, merge } from '@vtex/admin-ui'

export const PageHeader = createComponent(Flex, usePageHeader)

export function usePageHeader(props: PageHeaderProps): FlexProps {
  const { styleOverrides, size = 'regular', ...rest } = props

  const theme: StyleProp = {
    marginBottom: 2,
    border: 'divider-bottom',
    height: size === 'large' ? 128 : 76,
  }

  return {
    styles: merge(theme, styleOverrides),
    direction: 'column',
    element: 'header',
    justify: 'space-between',
    ...rest,
  }
}

export interface PageHeaderProps {
  children?: ReactNode
  styleOverrides?: StyleProp
  size?: 'regular' | 'large'
  id?: string
}
