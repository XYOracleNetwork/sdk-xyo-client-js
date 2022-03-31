import { XyoArchiveKey } from '../../../../models'
import { XyoApiSimple } from '../../../../Simple'

export class XyoArchivistArchiveSettingsKeyApi extends XyoApiSimple<XyoArchiveKey> {
  public key(key: string) {
    return new XyoApiSimple<XyoArchiveKey>({
      ...this.config,
      root: `${this.root}${key}/`,
    })
  }
}
