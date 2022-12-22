import { Archivist } from '@xyo-network/archivist'
import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { AbstractModule } from '@xyo-network/module'

import { XyoPayloadWithPartialMeta } from '../Payload'
import { SetArchivePermissions } from '../Query'

export type ArchivePermissionsArchivist = Archivist<SetArchivePermissions, XyoBoundWitness | null, XyoPayloadWithPartialMeta<SetArchivePermissions>> &
  AbstractModule

export type ArchivePermissionsArchivistFactory = (archive: string) => ArchivePermissionsArchivist
