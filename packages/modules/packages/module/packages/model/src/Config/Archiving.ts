import type { Schema } from '@xyo-network/payload-model'

import type { ModuleIdentifier } from '../ModuleIdentifier.ts'

export interface ArchivingModuleConfig {
  readonly archiving?: {
    readonly archivists?: ModuleIdentifier[]
    readonly queries?: Schema[]
  }
}
