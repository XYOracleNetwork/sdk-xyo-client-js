import { assertEx } from '@xylabs/sdk-js'
import { XyoAddressValue } from '@xyo-network/account'
import { XyoDataLike } from '@xyo-network/core'
import axios from 'axios'

import { XyoPayload } from '../models'

export type XyoObjectCategory = 'block' | 'payload'

export type HuriFetchFunction = (huri: Huri) => Promise<XyoPayload | undefined>

/* 
  Valid Huri:

  [<protocol>://][<archivist>/[<archive>/]]<hash>

  defaults:
    protocol: https
    archivist: api.archivist.xyo.network
*/

export interface HuriOptions {
  archivistUri?: string
}

export interface XyoFetchedPayload<T extends XyoPayload = XyoPayload> {
  payload: T
  huri?: Huri
}

export class Huri {
  public originalHref: string
  public protocol?: string
  public archivist?: string
  public archive?: string
  public hash: string

  private isHuri = true

  constructor(huri: XyoDataLike | Huri, { archivistUri }: HuriOptions = {}) {
    const huriString = Huri.isHuri(huri)?.href ?? typeof huri === 'string' ? (huri as string) : new XyoAddressValue(huri as XyoDataLike).hex
    this.originalHref = huriString

    const protocol = Huri.parseProtocol(huriString)
    this.protocol = protocol ?? 'https'

    const path = assertEx(Huri.parsePath(huriString), 'Missing path')
    this.hash = this.parsePath(path, protocol !== undefined)

    //if archivistUri sent, overwrite protocol and archivist
    if (archivistUri) {
      const archivistUriParts = archivistUri.split('://')
      this.protocol = archivistUriParts[0]
      this.archivist = archivistUriParts[1]
    }

    this.validateParse()
  }

  private parsePath(path: string, hasProtocol: boolean) {
    const pathParts = path.split('/')

    //if the protocal was found, then there is not allowed to be a leading /
    assertEx(!(hasProtocol && pathParts[0].length === 0), 'Invalid protocol seperator')

    //remove leading '/' if needed
    pathParts[0].length === 0 ? pathParts.shift() : null

    //hash is assumed to be the last part
    const hash = assertEx(pathParts.pop(), 'No hash specified')

    //archivist is assumed to be the first part
    this.archivist = pathParts.shift() ?? 'api.archivist.xyo.network'

    //the archive is whatever is left
    this.archive = pathParts.pop()

    //after we pull off all the path parts, there should be nothing left
    assertEx(pathParts.length === 0, 'Too many path parts')

    return hash
  }

  private validateParse() {
    //the archivist should not be zero length
    assertEx(this.archivist?.length !== 0, 'Invalid archivist length')

    //the archivist should not be zero length (can be undefined)
    assertEx(this.archive?.length !== 0, 'Invalid archive length')

    //the archive should not be set if the archivist is not set
    assertEx(!(this.archive && !this.archivist), 'If specifying archive, archivist is also required')
  }

  /*
  The full href or the hash
  */

  public get href() {
    const parts: string[] = []
    if (this.protocol) {
      parts.push(`${this.protocol}:/`)
    }
    if (this.archive) {
      parts.push(`${this.archive}`)
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
    return (await axios.get<XyoPayload>(huri.href)).data
  }

  private static parseProtocol(huri: string) {
    const protocolSplit = huri.split('//')
    assertEx(protocolSplit.length <= 2, `Invalid second protocol [${protocolSplit[2]}]`)
    const rawProtocol = protocolSplit.length === 2 ? protocolSplit.shift() : undefined
    if (rawProtocol) {
      const protocolParts = rawProtocol?.split(':')
      assertEx(protocolParts.length === 2, `Invalid protocol format [${rawProtocol}]`)
      assertEx(protocolParts[1].length === 0, `Invalid protocol format (post :) [${rawProtocol}]`)
      return protocolParts.shift()
    }
  }

  private static parsePath(huri: string) {
    const protocolSplit = huri.split('//')
    assertEx(protocolSplit.length <= 2, `Invalid format [${huri}]`)
    if (protocolSplit.length === 1) {
      return huri
    }
    if (protocolSplit.length === 2) {
      return protocolSplit[1]
    }
  }

  public static isHuri(value: unknown) {
    if (typeof value === 'object') {
      return (value as Huri).isHuri ? (value as Huri) : undefined
    }
    return undefined
  }
}
