import { Address } from '@xylabs/hex'
import { AccountInstance } from '@xyo-network/account-model'
import { AddressPayload, AttachableModuleInstance, ModuleIdentifier, ModuleInstance, ModuleQueryResult } from '@xyo-network/module-model'

import { ChildCertification, ChildCertificationFields } from './ChildCertification.ts'
import { NodeModule, NodeModuleEventData } from './Node.ts'
import { NodeParams } from './Params.ts'

export interface NodeQueryFunctions {
  attach: (id: ModuleIdentifier, external?: boolean) => Promise<Address | undefined>
  attachQuery: (id: ModuleIdentifier, external?: boolean, account?: AccountInstance) => Promise<ModuleQueryResult<AddressPayload>>
  attached: () => Promise<Address[]>
  attachedQuery: (account?: AccountInstance) => Promise<ModuleQueryResult<AddressPayload>>
  certify: (id: ModuleIdentifier) => Promise<ChildCertificationFields | undefined>
  certifyQuery: (id: ModuleIdentifier, account?: AccountInstance) => Promise<ModuleQueryResult<ChildCertification>>
  detach: (id: ModuleIdentifier) => Promise<Address | undefined>
  detachQuery: (id: ModuleIdentifier, account?: AccountInstance) => Promise<ModuleQueryResult<AddressPayload>>
  registered: () => Promise<Address[]>
  registeredQuery: (account?: AccountInstance) => Promise<ModuleQueryResult<AddressPayload>>
}

export interface NodeRegistrationFunctions {
  register?: (mod: AttachableModuleInstance) => Promise<void>
  registeredModules?: () => AttachableModuleInstance[]
  unregister?: (mod: ModuleInstance) => Promise<ModuleInstance>
}

export interface NodeInstance<TParams extends NodeParams = NodeParams, TEventData extends NodeModuleEventData = NodeModuleEventData>
  extends NodeModule<TParams, TEventData>,
  NodeQueryFunctions,
  NodeRegistrationFunctions,
  ModuleInstance<TParams, TEventData> {}
