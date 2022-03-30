import { XyoArchiveKey } from '../../../../models'
import { XyoApiSimple } from '../../../../Simple'

export class XyoArchivistArchiveSettingsKeyApi extends XyoApiSimple<XyoArchiveKey> {}

export class XyoArchivistArchiveSettingsKeysApi extends XyoApiSimple<XyoArchiveKey[]> {
  public key(key: string) {
    return new XyoArchivistArchiveSettingsKeyApi({
      ...this.config,
      root: `${this.root}${key}/`,
    })
  }
}
