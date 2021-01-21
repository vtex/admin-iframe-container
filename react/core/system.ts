import {
  createSystem,
  jsxs,
  ThemeProvider as RootProvider,
} from '@vtex/admin-ui'
import type { PropsWithChildren } from 'react'

export const system = createSystem('iframe-container')

export const ThemeProvider = (props: PropsWithChildren<unknown>) =>
  jsxs({
    component: RootProvider,
    props: {
      system,
      ...props,
    },
  })
