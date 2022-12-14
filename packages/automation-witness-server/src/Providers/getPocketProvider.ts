import { PocketProvider, Provider } from '@ethersproject/providers'
import { assertEx } from '@xylabs/assert'

import { PocketProviderConfig } from '../Model'

let instance: PocketProvider | undefined = undefined

export const getPocketProvider = (): Provider => {
  if (instance) return instance
  const config = getPocketProviderConfig()
  instance = new PocketProvider('homestead', config)
  return instance
}

export const canUsePocketProvider = (): boolean => {
  return !!process.env.POCKET_PORTAL_ID && !!process.env.POCKET_SECRET_KEY ? true : false
}

export const getPocketProviderConfig = (): PocketProviderConfig => {
  const applicationId = assertEx(process.env.POCKET_PORTAL_ID)
  const applicationSecretKey = assertEx(process.env.POCKET_SECRET_KEY)
  return { applicationId, applicationSecretKey }
}
