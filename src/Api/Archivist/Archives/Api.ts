import { XyoApiBase } from '../../Base'
import { XyoArchivistArchiveApi } from '../Archive'
import { ArchiveResponse } from '../models'

export class XyoArchivistArchivesApi extends XyoApiBase {
  public async get() {
    return await this.getEndpoint<ArchiveResponse[]>()
  }

  public select(archive = 'temp') {
    return new XyoArchivistArchiveApi({
      ...this.config,
      root: `${this.root}${archive}/`,
    })
  }
}
