import { AccountInstance } from '@xyo-network/account-model'
import { isArchivistModule } from '@xyo-network/archivist-model'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { isDivinerModule } from '@xyo-network/diviner-model'
import { DivinerWrapper } from '@xyo-network/diviner-wrapper'
import { Module } from '@xyo-network/module-model'
import { ModuleWrapper } from '@xyo-network/module-wrapper'
import { isNodeModule } from '@xyo-network/node-model'
import { NodeWrapper } from '@xyo-network/node-wrapper'
import { isSentinelModule } from '@xyo-network/sentinel-model'
import { SentinelWrapper } from '@xyo-network/sentinel-wrapper'
import { isWitnessModule } from '@xyo-network/witness-model'
import { WitnessWrapper } from '@xyo-network/witness-wrapper'

export const wrapModuleWithType = (mod: Module, account: AccountInstance): ModuleWrapper => {
  if (isArchivistModule(mod)) {
    return ArchivistWrapper.wrap(mod, account)
  }
  if (isDivinerModule(mod)) {
    return DivinerWrapper.wrap(mod, account)
  }
  if (isNodeModule(mod)) {
    return NodeWrapper.wrap(mod, account)
  }
  if (isSentinelModule(mod)) {
    return SentinelWrapper.wrap(mod, account)
  }
  if (isWitnessModule(mod)) {
    return WitnessWrapper.wrap(mod, account)
  }
  throw 'Failed to wrap'
}
