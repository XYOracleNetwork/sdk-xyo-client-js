import { assertEx } from '@xylabs/assert'
import { XyoAccount } from '@xyo-network/account'
import { TYPES } from '@xyo-network/node-core-types'
import { Container } from 'inversify'

export const addAddresses = (container: Container) => {
  const phrase = assertEx(process.env.ACCOUNT_SEED, 'ACCOUNT_SEED ENV VAR required to create Archivist')
  container.bind<XyoAccount>(TYPES.Account).toConstantValue(new XyoAccount({ phrase })).whenTargetNamed('root')
  container
    .bind<XyoAccount>(TYPES.Account)
    .toDynamicValue(() => XyoAccount.random())
    .whenTargetIsDefault()
}
