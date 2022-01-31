import { Parser } from 'bowser'

import { XyoPayload } from '../models'
import { XyoWitness } from '../XyoWitness'
import { getBowserJson } from './BrowserSystemInfo'

export interface XyoSystemInfoPayload extends XyoPayload {
  bowser?: Parser.ParsedResult
}

export class XyoSystemInfoWitness extends XyoWitness<XyoSystemInfoPayload> {
  constructor() {
    super({
      observer: (previousHash?: string) => {
        const result = {
          bowser: getBowserJson(),
          previous_hash: previousHash,
          schema: 'network.xyo.system.info',
        }
        return result
      },
    })
  }
}
