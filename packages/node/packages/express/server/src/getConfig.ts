import { XyoPayload } from '@xyo-network/payload'
import config, { IConfig, util } from 'config'

export const getConfig = async (): Promise<XyoPayload[]> => {
  const foo = config.get('')
  return await Promise.resolve([])
}
