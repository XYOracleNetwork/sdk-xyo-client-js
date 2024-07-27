import { axios, AxiosError } from '@xylabs/axios'
import { Hash } from '@xylabs/hex'
import { reverse } from '@xylabs/lodash'
import { isBrowser } from '@xylabs/platform'
import { ApiEnvelope } from '@xyo-network/api-models'
import { DnsRecordType, domainResolve } from '@xyo-network/dns'
import { FetchedPayload, Huri, HuriOptions } from '@xyo-network/huri'
import { NetworkPayload } from '@xyo-network/network'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { Alias, DomainPayload } from './Payload.js'

export interface FetchedAlias extends FetchedPayload {
  alias: Alias
}

export class DomainPayloadWrapper<T extends DomainPayload = DomainPayload> extends PayloadWrapper<T> {
  aliases?: FetchedAlias[] | null

  static async discover(reverseDomainName: string, proxy?: string) {
    const parts = reverseDomainName.split('.')
    for (let i = 2; i <= parts.length; i++) {
      const domainToCheck = reverse(parts.filter((_, index) => index < i)).join('.')
      const result = (await this.discoverDNSEntry(domainToCheck)) ?? (await this.discoverRootFile(domainToCheck, proxy))
      if (result) {
        return result
      }
    }
  }

  static async discoverDNSEntry(domain: string) {
    try {
      const hash = (await domainResolve(`_xyo.${domain}`, DnsRecordType.TXT))?.Answer?.[0]?.data
      if (hash) {
        const huri = new Huri(hash)
        const payload = (await huri.fetch()) as DomainPayload
        if (payload) {
          return new DomainPayloadWrapper(payload)
        }
      }
    } catch {
      console.log(`DomainConfig dns reading error entry not found [${domain}]`)
    }
  }

  static async discoverRootFile(domain: string, proxy?: string) {
    return isBrowser() || proxy ? await this.discoverRootFileWithProxy(domain, proxy) : await this.discoverRootFileDirect(domain)
  }

  static async discoverRootFileDirect(domain: string) {
    try {
      const config = (await axios.get<DomainPayload>(`https://${domain}/xyo-config.json`)).data
      return new DomainPayloadWrapper(config)
    } catch {
      console.log(`DomainConfig root file not found [${domain}]`)
    }
  }

  static async discoverRootFileWithProxy(domain: string, proxy = 'https://api.archivist.xyo.network/domain') {
    try {
      const requestUrl = `${proxy}/${domain.split('.').reverse().join('.')}`
      const config = (await axios.get<ApiEnvelope<DomainPayload>>(requestUrl)).data.data
      return new DomainPayloadWrapper(config)
    } catch (ex) {
      const error = ex as AxiosError
      console.log(`DomainConfig root file not found using proxy [${domain}] [${error.code}]`)
    }
  }

  async fetch(networkSlug?: Hash) {
    await this.fetchAliases(networkSlug)
  }

  async fetchAliases(networkSlug?: Hash) {
    //set it to null to signify fetch ran
    this.aliases = null

    const archivistUri = await this.findArchivistUri(networkSlug)
    if (this.payload.aliases) {
      const fetchedAliases = await Promise.all(
        Object.entries(this.payload.aliases ?? {}).map(([, alias]) => {
          return this.fetchAlias(alias, { archivistUri })
        }),
      )
      //cast to FetchedPayload[] after we filter out any null/undefined entries
      this.aliases = fetchedAliases.filter(Boolean) as FetchedAlias[]
    }
  }

  private async fetchAlias(alias: Alias, huriOptions?: HuriOptions): Promise<FetchedAlias | null> {
    const huri = new Huri(alias.huri, huriOptions)
    const payload = await huri.fetch()
    return payload ? { alias, huri, payload: payload } : null
  }

  private async findArchivistUri(hash?: Hash): Promise<string | undefined> {
    return (await this.getNetwork(hash))?.nodes?.find((payload) => (payload.type === 'archivist' ? payload : undefined))?.uri
  }

  private async getNetwork(hash?: Hash): Promise<NetworkPayload | undefined> {
    return hash ? await PayloadBuilder.findByDataHash(this.payload.networks, hash) : this.payload.networks?.[0]
  }
}
