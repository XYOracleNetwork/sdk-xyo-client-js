import { XyoArchivePath } from './ArchivePath'

export interface XyoArchive extends XyoArchivePath {
  user?: string
  accessControl?: boolean
}
