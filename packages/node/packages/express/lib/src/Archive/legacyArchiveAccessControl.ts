import { XyoArchive } from '@xyo-network/api'

/**
 * Determines if there's no access controls on an archive
 * @param archive The archive record
 * @returns True if there's no access controls, false otherwise
 */
export const isLegacyPublicArchive = (archive?: XyoArchive | null | undefined): boolean => {
  return !isLegacyPrivateArchive(archive)
}

/**
 * Determines if there's access controls on an archive
 * @param archive The archive record
 * @returns True if there's access controls, false otherwise
 */
export const isLegacyPrivateArchive = (archive?: XyoArchive | null | undefined): boolean => {
  if (!archive) {
    return true
  }
  const { accessControl } = archive
  let controls = false
  if (accessControl === true) {
    controls = true
  } else if (accessControl === false) {
    controls = false
  } else {
    controls = !!accessControl?.access
  }
  return controls
}
