import { Address } from '@xylabs/hex'
import { Promisable } from '@xylabs/promise'
import { ModuleManifestPayload } from '@xyo-network/manifest-model'
import { Payload } from '@xyo-network/payload-model'

import { AddressPreviousHashPayload } from '../Payload'

export interface ModuleQueryFunctions {
  manifest: (maxDepth?: number, ignoreAddresses?: Address[]) => Promisable<ModuleManifestPayload>
  moduleAddress: () => Promisable<AddressPreviousHashPayload[]>
  state: () => Promisable<Payload[]>
}
