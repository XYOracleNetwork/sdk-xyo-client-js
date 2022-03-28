import { XyoArchive } from '../../models'
import { XyoApiSimple } from '../../Simple'
import { XyoArchivistArchiveApi } from '../Archive'

export class XyoArchivistArchivesApi extends XyoApiSimple<XyoArchive[]> {
  public archive(archive = 'temp') {
    return new XyoArchivistArchiveApi({
      ...this.config,
      root: `${this.root}${archive}/`,
    })
  }

  /** @deprecated: use archive(string) instead */
  public select(archive = 'temp') {
    return this.archive(archive)
  }
}
