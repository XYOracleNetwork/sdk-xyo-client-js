import { ModuleList } from './ModuleList'

export const ARCHIVIST_TYPES: ModuleList = {
  ArchiveArchivist: Symbol('ArchiveArchivist'),
  ArchiveBoundWitnessArchivistFactory: Symbol('ArchiveBoundWitnessArchivistFactory'),
  ArchiveKeyRepository: Symbol('ArchiveKeyRepository'),
  ArchivePayloadArchivistFactory: Symbol('ArchivePayloadArchivistFactory'),
  ArchivePermissionsArchivistFactory: Symbol('ArchivePermissionsArchivistFactory'),
  Archivist: Symbol('Archivist'),
  BoundWitnessArchivist: Symbol('BoundWitnessArchivist'),
  PayloadArchivist: Symbol('PayloadArchivist'),
  UserArchivist: Symbol('UserArchivist'),
  WitnessedPayloadArchivist: Symbol('WitnessedPayloadArchivist'),
}
