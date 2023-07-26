import { AccountInstance } from '@xyo-network/account-model'
import { asDivinerInstance, DivinerInstance } from '@xyo-network/diviner-model'
import { DivinerWrapper } from '@xyo-network/diviner-wrapper'

import { getModuleByName } from '../Node'

export const getDivinerByName = async (name: string, account?: AccountInstance): Promise<DivinerInstance> => {
  const diviner = asDivinerInstance(await getModuleByName(name), 'Failed to cast diviner')
  return account ? DivinerWrapper.wrap(diviner, account) : diviner
}
