import { Address } from '@xylabs/hex'
import { Promisable } from '@xylabs/promise'
import { AccountInstance } from '@xyo-network/account-model'
import { ModuleManifestPayload } from '@xyo-network/manifest-model'
import { Payload } from '@xyo-network/payload-model'

import { ModuleQueryResult } from '../ModuleQueryResult'
import { AddressPreviousHashPayload } from '../Payload'

export interface ModuleQueryFunctions {
  manifest: (maxDepth?: number, ignoreAddresses?: Address[]) => Promisable<ModuleManifestPayload>
  manifestQuery: (account: AccountInstance, maxDepth?: number, ignoreAddresses?: Address[]) => Promisable<ModuleQueryResult<ModuleManifestPayload>>
  moduleAddress: () => Promisable<AddressPreviousHashPayload[]>
  state: () => Promisable<Payload[]>
  stateQuery: (account: AccountInstance) => Promisable<ModuleQueryResult>
}
