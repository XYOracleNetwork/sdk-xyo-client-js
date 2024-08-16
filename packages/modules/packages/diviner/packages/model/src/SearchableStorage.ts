import type { ModuleIdentifier } from '@xyo-network/module-model'

/**
 * Configuration for searchable storage of local state
 */
export interface SearchableStorage {
  /**
   * Name/Address of the archivist where intermediate communications are stored
   */
  archivist: ModuleIdentifier
  /**
   * Name/Address of the diviner where intermediate communications are filtered
   */
  boundWitnessDiviner?: ModuleIdentifier
  /**
   * Name/Address of the diviner where intermediate communications are filtered
   */
  payloadDiviner?: ModuleIdentifier
}
