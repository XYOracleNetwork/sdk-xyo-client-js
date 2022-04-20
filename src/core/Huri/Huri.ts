import { assertEx } from '@xylabs/sdk-js'
import axios from 'axios'

import { XyoPayload } from '../Payload'

export type XyoObjectCategory = 'block' | 'payload'

export type HuriFetchFunction = (huri: Huri) => Promise<XyoPayload | undefined>

/* 
  Valid Huri:

  [<protocol>://][archivist-host]/<hash>

  defaults:
    protocol: https
    archivist: api.archivist.xyo.network
*/

export interface HuriOptions {
  archivistUri?: string
}

export class Huri {
  public originaHref: string
  public protocol?: string
  public archivist?: string
  public hash: string

  constructor(huri: string, { archivistUri }: HuriOptions = {}) {
    this.originaHref = huri
    const protocolSplit = huri.split(':/')
    this.protocol = protocolSplit.length >= 2 ? protocolSplit.shift() : 'https'

    const pathSplit = assertEx(protocolSplit.shift()?.split('/'), 'No hash specified')

    //remove leading '/' if needed
    pathSplit[0].length === 0 ? pathSplit.shift() : null

    this.hash = assertEx(pathSplit.pop(), 'No hash specified')
    this.archivist = pathSplit.pop() ?? archivistUri ?? 'api.archivist.xyo.network'
    assertEx(pathSplit.length === 0, 'Too many path parts')
  }

  /*
  The full href or the hash
  */

  public get href() {
    const parts: string[] = []
    if (this.protocol) {
      parts.push(`${this.protocol}:/`)
    }
    if (this.archivist) {
      parts.push(`${this.archivist}`)
    }
    parts.push(this.hash)
    return parts.join('/')
  }

  public toString() {
    return this.href
  }

  public async fetch() {
    return await Huri.fetch(this)
  }

  static async fetch(huri: Huri): Promise<XyoPayload | undefined> {
    console.log(`fetching: ${huri.href}`)
    return (await axios.get<XyoPayload>(huri.href)).data
  }
}
