import { ModuleList } from './ModuleList'

export const ARCHIVIST_TYPES: ModuleList = {
  ArchiveBoundWitnessArchivistFactory: Symbol('ArchiveBoundWitnessArchivistFactory'),
  ArchivePayloadArchivistFactory: Symbol('ArchivePayloadArchivistFactory'),
  Archivist: Symbol('Archivist'),
  BoundWitnessArchivist: Symbol('BoundWitnessArchivist'),
  PayloadArchivist: Symbol('PayloadArchivist'),
  UserArchivist: Symbol('UserArchivist'),
}
