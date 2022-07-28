import { BaseProvider } from '@metamask/providers'

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ethereum: BaseProvider
  }
}
