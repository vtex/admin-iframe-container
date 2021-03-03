import type { ReactNode } from 'react'
import type { FlexProps, StyleProp } from '@vtex/admin-ui'
import {
  createComponent,
  Heading,
  jsxs,
  Flex,
  merge,
  Button,
  IconArrow,
} from '@vtex/admin-ui'

export const Navbar = createComponent(Flex, useNavbar)

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
        ? jsxs(Button, {
            variant: 'tertiary',
            onClick: () => link.onClick,
            icon: jsxs(IconArrow, {
              direction: 'left',
              title: link.label,
            }),
          })
        : null,
      jsxs(
        Heading,
        {
          styleOverrides: {
            fontSettings: 'medium',
          },
        },
        title
      ),
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
