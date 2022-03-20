import { XyoArchivistApiBase } from '../Base'
import { XyoArchivistArchiveApi } from './Archive'

export class XyoArchivistArchivesApi extends XyoArchivistApiBase {
  public async list() {
    return await this.getEndpoint<{ archive: string }[]>()
  }

  public select(archive = 'temp') {
    return new XyoArchivistArchiveApi({
      ...this.config,
      root: `${this.root}${archive}/`,
    })
  }
}
