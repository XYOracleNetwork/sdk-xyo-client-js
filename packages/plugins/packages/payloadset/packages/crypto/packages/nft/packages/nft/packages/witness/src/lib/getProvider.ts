import { BaseProvider } from '@ethersproject/providers'

export const getProvider = (providers: BaseProvider[]) => {
  return providers[Date.now() % providers.length] //pick a random provider
}
