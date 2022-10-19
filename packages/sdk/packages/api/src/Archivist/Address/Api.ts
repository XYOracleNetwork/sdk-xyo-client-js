import { XyoBoundWitness } from '@xyo-network/boundwitness'

import { XyoApiConfig } from '../../models'
import { XyoApiSimple } from '../../Simple'
import { XyoArchivistPayloadApi } from '../Payload'

export class XyoAddressApi<T extends XyoBoundWitness = XyoBoundWitness, C extends XyoApiConfig = XyoApiConfig> extends XyoArchivistPayloadApi<T, C> {
  public address(address: string): XyoApiSimple<XyoBoundWitness[]> {
    return new XyoApiSimple<XyoBoundWitness[]>({
      ...this.config,
      root: `${this.root}address/${address}/`,
    })
  }
}
