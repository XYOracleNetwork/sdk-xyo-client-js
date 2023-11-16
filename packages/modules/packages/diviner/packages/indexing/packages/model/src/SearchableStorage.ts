/**
 * Describes an Archivist/Diviner combination
 * that enables searching signed payloads
 */
export interface SearchableStorage {
  archivist: string
  boundWitnessDiviner: string
  payloadDiviner: string
}
