import { ExternalProvider } from '@ethersproject/providers'
import { HttpProvider } from 'web3-providers-http'

type WithoutSends = Omit<Omit<HttpProvider, 'sendAsync'>, 'send'>

export const getExternalProviderFromHttpProvider = (provider: HttpProvider): ExternalProvider => {
  const external = provider as WithoutSends
  // delete (external as { send?: unknown })?.send
  // delete (external as { sendAsync?: unknown })?.sendAsync
  return external
}
