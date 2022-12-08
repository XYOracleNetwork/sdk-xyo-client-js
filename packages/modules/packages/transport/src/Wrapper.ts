import { XyoArchivistApi } from '@xyo-network/api'
import { ModuleQueryResult, ModuleWrapper, XyoModuleParams, XyoQueryBoundWitness } from '@xyo-network/module'
import { AbstractNode } from '@xyo-network/node'
import { XyoPayload } from '@xyo-network/payload'

import { XyoRemoteModuleConfig } from './Config'

export type XyoRemoteAddressHistoryDivinerParams = XyoModuleParams<XyoRemoteModuleConfig> & {
  api?: XyoArchivistApi
}

export abstract class RemoteModuleWrapper<T extends AbstractNode = AbstractNode> extends ModuleWrapper<T> {
  // constructor(protected readonly node: AbstractNode) {}
  // TODO: How to handle sub address paths
  // TODO: How to X
  override async query<T extends XyoQueryBoundWitness = XyoQueryBoundWitness>(query: T, payloads?: XyoPayload[]): Promise<ModuleQueryResult> {
    await Promise.resolve()
    throw new Error('TODO')
  }
}
