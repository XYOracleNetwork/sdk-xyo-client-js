import { XyoArchivistApiBase } from '../../../Base'
import { ArchiveKey } from '../../../models'

export class XyoArchivistArchiveSettingsKeysApi extends XyoArchivistApiBase {
  public async get() {
    return await this.getEndpoint<ArchiveKey[]>()
  }

  public async post() {
    return await this.postEndpoint<ArchiveKey>('')
  }
}
