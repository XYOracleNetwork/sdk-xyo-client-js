import type { BaseProvider } from '@metamask/providers'

declare global {
  var ethereum: BaseProvider
}
