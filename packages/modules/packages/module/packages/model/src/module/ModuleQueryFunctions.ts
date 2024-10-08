import type { Address } from '@xylabs/hex'
import type { Promisable } from '@xylabs/promise'
import type { AccountInstance } from '@xyo-network/account-model'
import type { ModuleManifestPayload } from '@xyo-network/manifest-model'
import type { Payload } from '@xyo-network/payload-model'

import type { ModuleQueryResult } from '../ModuleQueryResult.ts'
import type { AddressPayload, AddressPreviousHashPayload } from '../Payload/index.ts'

export interface ModuleQueryFunctions {
  manifest: (maxDepth?: number, ignoreAddresses?: Address[]) => Promisable<ModuleManifestPayload>
  manifestQuery: (account: AccountInstance, maxDepth?: number, ignoreAddresses?: Address[]) => Promisable<ModuleQueryResult<ModuleManifestPayload>>
  moduleAddress: () => Promisable<(AddressPreviousHashPayload | AddressPayload)[]>
  state: () => Promisable<Payload[]>
  stateQuery: (account: AccountInstance) => Promisable<ModuleQueryResult>
}
