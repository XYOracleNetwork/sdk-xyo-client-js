import { XyoArchive } from '../../models'
import { XyoApiSimple } from '../../Simple'
import { XyoArchivistArchiveApi } from '../Archive'

export class XyoArchivistArchivesApi extends XyoApiSimple<XyoArchive[]> {
  archive(archive = 'temp') {
    return new XyoArchivistArchiveApi({
      ...this.config,
      root: `${this.root}${archive}/`,
    })
  }
}
