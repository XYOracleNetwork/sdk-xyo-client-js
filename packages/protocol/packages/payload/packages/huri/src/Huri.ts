import { assertEx } from '@xylabs/assert'
import { axios } from '@xylabs/axios'
import { Hash } from '@xylabs/hex'
import { AddressValue } from '@xyo-network/account'
import { Payload } from '@xyo-network/payload-model'

export type ObjectCategory = 'block' | 'payload'

export type HuriFetchFunction = (huri: Huri) => Promise<Payload | undefined>

/* 
  Valid Huri:

  [<protocol>://][<archivist>/[<archive>/]]<hash>

  defaults:
    protocol: https
    archivist: api.archivist.xyo.network
*/

export interface HuriOptions {
  archivistUri?: string
  token?: string
}

export interface FetchedPayload<T extends Payload = Payload> {
  huri?: Huri
  payload: T
}

export class Huri<T extends Payload = Payload> {
  archive?: string
  archivist?: string
  hash: string
  originalHref: string
  protocol?: string
  token?: string

  private isHuri = true

  constructor(huri: Hash | Huri | string, { archivistUri, token }: HuriOptions = {}) {
    const huriString =
      Huri.isHuri(huri)?.href ?? typeof huri === 'string' ? (huri as string) : huri instanceof ArrayBuffer ? new AddressValue(huri).hex : huri.href
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

    this.token = token

    this.validateParse()
  }

  /*
  The full href or the hash
  */
  get href() {
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

  static async fetch<T extends Payload = Payload>(huri: Huri): Promise<T | undefined> {
    const AuthHeader = huri.token ? { Authorization: `Bearer ${huri.token}` } : undefined
    return (await axios.get<T>(huri.href, { headers: AuthHeader })).data
  }

  static isHuri(value: unknown) {
    if (typeof value === 'object') {
      return (value as Huri).isHuri ? (value as Huri) : undefined
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

  async fetch(): Promise<T | undefined> {
    return await Huri.fetch<T>(this)
  }

  toString() {
    return this.href
  }

  private parsePath(path: string, hasProtocol: boolean) {
    const pathParts = path.split('/')

    //if the protocol was found, then there is not allowed to be a leading /
    assertEx(!(hasProtocol && pathParts[0].length === 0), 'Invalid protocol separator')

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
}
