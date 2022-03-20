import { XyoArchivistApiBase } from '../Base'
import { ArchiveResponse } from '../models'
import { XyoArchivistArchiveApi } from './Archive'

export class XyoArchivistArchivesApi extends XyoArchivistApiBase {
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
