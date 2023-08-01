import type { ExternalProvider } from '@ethersproject/providers'
import { HttpProvider } from 'web3-providers-http'

type WithOptionalSends = { send?: unknown; sendAsync?: unknown }
type WithoutSends = Omit<Omit<HttpProvider, 'sendAsync'>, 'send'>

/**
 * This method attempts to appease TypeScript without just
 * casting away the underlying types as to preserve as much
 * of the type information as possible.
 * The direct conversion from HttpProvider to ExternalProvider
 * won't work because the types for send/sendAsync are incompatible
 * (implemented as async in one vs with callbacks in the other).
 * However, the disparity is handled under the hood by the library
 * by closing over the request function and promisify-ing it.
 * @param provider
 * @returns
 */
export const getExternalProviderFromHttpProvider = (provider: HttpProvider): ExternalProvider => {
  const external = provider as WithoutSends
  delete (external as WithOptionalSends)?.send
  delete (external as WithOptionalSends)?.sendAsync
  return external
}
