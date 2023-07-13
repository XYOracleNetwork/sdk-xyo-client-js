import { AccountInstance } from '@xyo-network/account-model'
import { DivinerModule } from '@xyo-network/diviner-model'
import { IndirectDivinerWrapper } from '@xyo-network/diviner-wrapper'

import { unitTestSigningAccount } from '../Account'
import { getModuleByName } from '../Node'

export const getDivinerByName = async (name: string, account?: AccountInstance): Promise<IndirectDivinerWrapper> => {
  const module = await getModuleByName<DivinerModule>(name)
  return new IndirectDivinerWrapper({ account: account ?? (await unitTestSigningAccount()), module })
}
