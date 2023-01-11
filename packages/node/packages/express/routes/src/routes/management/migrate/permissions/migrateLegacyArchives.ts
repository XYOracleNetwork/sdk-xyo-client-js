import { XyoArchive } from '@xyo-network/api'
import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { isLegacyPrivateArchive } from '@xyo-network/express-node-lib'
import {
  ArchivePermissionsArchivistFactory,
  privateArchivePermissions,
  publicArchivePermissions,
  SetArchivePermissionsPayload,
} from '@xyo-network/node-core-model'

export const migrateLegacyArchives = async (
  archivist: ArchivePermissionsArchivistFactory,
  archives: XyoArchive[],
): Promise<Array<XyoBoundWitness | null>> => {
  const migrations = archives.map(async (archive) => {
    // create a new public/private archive record for the legacy archive
    const permissions: SetArchivePermissionsPayload = isLegacyPrivateArchive(archive) ? privateArchivePermissions : publicArchivePermissions
    return (await archivist(archive.archive)).insert([{ ...permissions, _archive: archive.archive }])
  })
  return (await Promise.all(migrations)).flat()
}
