import { ModuleManifestPayload } from '@xyo-network/manifest-model'
import { Payload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

import { ModuleDescriptionPayload } from '../../dist'
import { AddressPreviousHashPayload } from '../Queries'

export type ModuleQueryFunctions = {
  describe: () => Promise<ModuleDescriptionPayload>
  discover: () => Promisable<Payload[]>
  manifest: (ignoreAddresses?: string[]) => Promisable<ModuleManifestPayload>
  moduleAddress: () => Promisable<AddressPreviousHashPayload[]>
}
