import { Promisable } from '@xylabs/promise'
import { AnyModuleManifestPayload } from '@xyo-network/manifest-model'
import { Payload } from '@xyo-network/payload-model'

import { ModuleDescription } from '../ModuleDescription'
import { AddressPreviousHashPayload } from '../Queries'

export interface ModuleQueryFunctions {
  describe: () => Promise<ModuleDescription>
  discover: () => Promisable<Payload[]>
  manifest: (maxDepth?: number, ignoreAddresses?: string[]) => Promisable<AnyModuleManifestPayload>
  moduleAddress: () => Promisable<AddressPreviousHashPayload[]>
  state: () => Promisable<Payload[]>
}
