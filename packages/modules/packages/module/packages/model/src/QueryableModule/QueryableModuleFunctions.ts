import type { Address, Promisable } from '@xylabs/sdk-js'
import type { AccountInstance } from '@xyo-network/account-model'
import type { ModuleManifestPayload } from '@xyo-network/manifest-model'
import type { Payload } from '@xyo-network/payload-model'

import type { ModuleQueryResult } from '../ModuleQueryResult.ts'
import type { AddressPayload, AddressPreviousHashPayload } from '../Payload/index.ts'

export interface QueryableModuleFunctions {
  manifest: (maxDepth?: number, ignoreAddresses?: Address[]) => Promisable<ModuleManifestPayload>
  manifestQuery: (account: AccountInstance, maxDepth?: number, ignoreAddresses?: Address[]) => Promisable<ModuleQueryResult<ModuleManifestPayload>>
  moduleAddress: () => Promisable<(AddressPreviousHashPayload | AddressPayload)[]>
  state: () => Promisable<Payload[]>
  stateQuery: (account: AccountInstance) => Promisable<ModuleQueryResult>
}

/** @deprecated use QueryableModuleFunctions instead */
export interface ModuleQueryFunctions extends QueryableModuleFunctions {}
