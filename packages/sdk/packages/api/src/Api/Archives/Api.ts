import { XyoArchive } from '../../models'
import { XyoApiSimple } from '../../Simple'
import { XyoArchivistArchiveApi } from '../Archive'

export class XyoArchivistArchivesApi extends XyoApiSimple<XyoArchive[]> {
  /**
   * @deprecated Use module API
   */
  public archive(archive = 'temp') {
    return new XyoArchivistArchiveApi({
      ...this.config,
      root: `${this.root}${archive}/`,
    })
  }
}
