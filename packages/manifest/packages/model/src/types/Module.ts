import { Address } from '@xylabs/hex'

import { ConfigManifest } from './Config'
import { Manifest } from './Manifest'
import { ModuleOptionsManifest } from './Options'

export type ModuleManifest = Manifest & {
  config: ConfigManifest
  options?: ModuleOptionsManifest
  status?: {
    address: Address
  }
}
