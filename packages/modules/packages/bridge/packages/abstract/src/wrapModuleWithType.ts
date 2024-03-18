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

export const wrapModuleWithType = (module: Module, account: AccountInstance): ModuleWrapper => {
  if (isArchivistModule(module)) {
    return ArchivistWrapper.wrap(module, account)
  }
  if (isDivinerModule(module)) {
    return DivinerWrapper.wrap(module, account)
  }
  if (isNodeModule(module)) {
    return NodeWrapper.wrap(module, account)
  }
  if (isSentinelModule(module)) {
    return SentinelWrapper.wrap(module, account)
  }
  if (isWitnessModule(module)) {
    return WitnessWrapper.wrap(module, account)
  }
  throw 'Failed to wrap'
}
