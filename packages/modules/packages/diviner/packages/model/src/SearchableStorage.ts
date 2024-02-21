import { ModuleIdentifier } from '@xyo-network/module-model'

/**
 * Describes an Archivist/Diviner combination
 * that enables searching signed payloads
 */
export interface SearchableStorage {
  archivist: ModuleIdentifier
  boundWitnessDiviner: ModuleIdentifier
  payloadDiviner: ModuleIdentifier
}
