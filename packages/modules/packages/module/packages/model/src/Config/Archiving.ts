import { Schema } from '@xyo-network/payload-model'

import { ModuleIdentifier } from '../ModuleIdentifier'

export interface ArchivingModuleConfig {
  readonly archiving?: {
    readonly archivists?: ModuleIdentifier[]
    readonly queries?: Schema[]
  }
}
