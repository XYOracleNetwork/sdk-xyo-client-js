import { assertEx } from '@xylabs/sdk-js'
import { PayloadWrapper } from '@xyo-network/payload'

import { knownArchivists } from './knownArchivists'
import { knownDiviners } from './knownDiviners'
import { XyoNetworkNodePayload } from './XyoNetworkNodePayload'

export class XyoNetworkNodePayloadWrapper<T extends XyoNetworkNodePayload = XyoNetworkNodePayload> extends PayloadWrapper<T> {
  static known(hash: string) {
    const config = assertEx(
      knownArchivists().find((payload) => new XyoNetworkNodePayloadWrapper(payload).hash === hash) ??
        knownDiviners().find((payload) => new XyoNetworkNodePayloadWrapper(payload).hash === hash),
      'Unknown node',
    )
    return new XyoNetworkNodePayloadWrapper(config)
  }
}

/** @deprecated use XyoNodePayloadWrapper instead */
export const XyoNodeConfigWrapper = XyoNetworkNodePayloadWrapper
