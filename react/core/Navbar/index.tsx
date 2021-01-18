import type { ReactNode } from 'react'
import type { FlexProps, StyleProp } from '@vtex/admin-ui'
import { Heading, jsxs, Flex, merge, Button } from '@vtex/admin-ui'
import { IconArrow } from '@vtex/admin-ui-icons'

export function Navbar(props: NavbarProps) {
  const navbarProps = useNavbar(props)

  return jsxs({
    component: Flex,
    props: navbarProps,
  })
}

export function useNavbar(props: NavbarProps): FlexProps {
  const { styleOverrides, children, title, link, ...rest } = props

  const theme: StyleProp = {
    height: 76,
    paddingX: 4,
  }

  return {
    styles: merge(theme, styleOverrides),
    children: [
      link
        ? jsxs({
            component: Button,
            props: {
              variant: 'tertiary',
              onClick: () => link.onClick,
              icon: jsxs({
                component: IconArrow,
                props: {
                  direction: 'left',
                  title: link.label,
                },
              }),
            },
          })
        : null,
      jsxs({
        component: Heading,
        props: {
          styleOverrides: {
            fontSettings: 'medium',
          },
        },
        children: title,
      }),
    ],
    align: 'center',
    ...rest,
  }
}

export interface NavbarProps {
  children?: ReactNode
  styleOverrides?: StyleProp
  title?: ReactNode
  link?: {
    label: string
    onClick: () => void
  }
}
