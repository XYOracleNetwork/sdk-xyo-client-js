import { ModuleIdentifier } from '../ModuleIdentifier'

export interface ArchivingModuleConfig {
  readonly archiving?: {
    readonly archivists?: ModuleIdentifier[]
  }
}
