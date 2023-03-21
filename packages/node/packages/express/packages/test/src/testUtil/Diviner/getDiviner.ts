import { AccountInstance } from '@xyo-network/account-model'
import { DivinerModule, DivinerWrapper } from '@xyo-network/modules'

import { unitTestSigningAccount } from '../Account'
import { getModuleByName } from '../Node'

export const getDivinerByName = async (name: string, account: AccountInstance = unitTestSigningAccount): Promise<DivinerWrapper> => {
  const module = await getModuleByName<DivinerModule>(name)
  return new DivinerWrapper({ account, module })
}
