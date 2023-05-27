import { assertEx } from '@xylabs/assert'
import { Hasher } from '@xyo-network/core'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { knownArchivists } from './knownArchivists'
import { knownDiviners } from './knownDiviners'
import { XyoNetworkNodePayload } from './XyoNetworkNodePayload'

export class XyoNetworkNodePayloadWrapper<T extends XyoNetworkNodePayload = XyoNetworkNodePayload> extends PayloadWrapper<T> {
  static async known(hash: string) {
    const config = assertEx((await Hasher.find(knownArchivists(), hash)) ?? (await Hasher.find(knownDiviners(), hash)), 'Unknown node')
    return new XyoNetworkNodePayloadWrapper(config)
  }
}
