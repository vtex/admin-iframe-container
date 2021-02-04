import type { ReactNode } from 'react'
import type { FlexProps, StyleProp } from '@vtex/admin-ui'
import { Heading, jsxs, Flex, merge, createComponent } from '@vtex/admin-ui'

export const Navbar = createComponent(Flex, useNavbar)

export function useNavbar(props: NavbarProps): FlexProps {
  const { styleOverrides, children, title, ...rest } = props

  const theme: StyleProp = {
    height: 76,
    paddingX: 4,
  }

  return {
    styles: merge(theme, styleOverrides),
    children: jsxs(
      Heading,
      {
        styleOverrides: {
          fontSettings: 'medium',
        },
      },
      title
    ),
    align: 'center',
    ...rest,
  }
}

export interface NavbarProps {
  children?: ReactNode
  styleOverrides?: StyleProp
  title?: ReactNode
}
