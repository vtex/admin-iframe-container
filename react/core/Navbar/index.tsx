import type { ReactNode } from 'react'
import type { FlexProps, StyleProp } from '@vtex/admin-ui'
import { Heading, jsxs, Flex, merge } from '@vtex/admin-ui'

export function Navbar(props: NavbarProps) {
  const navbarProps = useNavbar(props)

  return jsxs({
    component: Flex,
    props: navbarProps,
  })
}

export function useNavbar(props: NavbarProps): FlexProps {
  const { styleOverrides, children, title, ...rest } = props

  const theme: StyleProp = {
    height: 76,
    paddingX: 4,
  }

  return {
    styles: merge(theme, styleOverrides),
    children: jsxs({
      component: Heading,
      props: {
        styleOverrides: {
          fontSettings: 'medium',
        },
      },
      children: title,
    }),
    align: 'center',
    ...rest,
  }
}

export interface NavbarProps {
  children?: ReactNode
  styleOverrides?: StyleProp
  title?: ReactNode
}
