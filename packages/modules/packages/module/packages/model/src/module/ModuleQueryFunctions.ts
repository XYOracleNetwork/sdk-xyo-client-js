import { Address } from '@xylabs/hex'
import { Promisable } from '@xylabs/promise'
import { ModuleManifestPayload } from '@xyo-network/manifest-model'
import { Payload } from '@xyo-network/payload-model'

import { ModuleDescription } from '../ModuleDescription'
import { AddressPreviousHashPayload } from '../Queries'

export interface ModuleQueryFunctions {
  describe: () => Promise<ModuleDescription>
  discover: () => Promisable<Payload[]>
  manifest: (maxDepth?: number, ignoreAddresses?: Address[]) => Promisable<ModuleManifestPayload>
  moduleAddress: () => Promisable<AddressPreviousHashPayload[]>
  state: () => Promisable<Payload[]>
}
