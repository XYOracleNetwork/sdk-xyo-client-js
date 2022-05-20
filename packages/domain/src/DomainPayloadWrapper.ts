import { XyoApiEnvelope } from '@xyo-network/api'
import { DnsRecordType, domainResolve, Huri, HuriOptions, isBrowser, XyoFetchedPayload, XyoPayloadWrapper } from '@xyo-network/core'
import { XyoNetworkPayload, XyoNetworkPayloadWrapper } from '@xyo-network/network'
import axios, { AxiosError } from 'axios'
import reverse from 'lodash/reverse'

import { XyoAlias, XyoDomainPayload } from './DomainPayload'

export class XyoDomainPayloadWrapper<T extends XyoDomainPayload = XyoDomainPayload> extends XyoPayloadWrapper<T> {
  public aliases?: XyoFetchedPayload[] | null

  private getNetwork(hash?: string): XyoNetworkPayload | undefined {
    return hash ? this.payload.networks?.find((value) => new XyoNetworkPayloadWrapper(value).hash === hash) : this.payload.networks?.[0]
  }

  private findArchivistUri(hash?: string): string | undefined {
    return this.getNetwork(hash)?.nodes?.find((payload) => (payload.type === 'archivist' ? payload : undefined))?.uri
  }

  private async fetchAlias(alias: XyoAlias, huriOptions?: HuriOptions): Promise<XyoFetchedPayload | null> {
    const huri = new Huri(alias.huri, huriOptions)
    const payload = await huri.fetch()
    return payload ? { huri, payload: payload } : null
  }

  public async fetchAliases(networkSlug?: string) {
    //set it to null to signify fetch ran
    this.aliases = null

    const archivistUri = this.findArchivistUri(networkSlug)
    if (this.payload.aliases) {
      const fetchedAliases = await Promise.all(
        Object.entries(this.payload.aliases ?? {}).map(([, alias]) => {
          return this.fetchAlias(alias, { archivistUri })
        })
      )
      //cast to XyoFetchedPayload[] after we filter out any null/undefined entries
      this.aliases = fetchedAliases.filter((alias) => alias) as XyoFetchedPayload[]
    }
  }

  public async fetch(networkSlug?: string) {
    await this.fetchAliases(networkSlug)
  }

  public static async discoverRootFileWithProxy(domain: string, proxy = 'https://api.archivist.xyo.network/domain') {
    try {
      const requestUrl = `${proxy}/${domain.split('.').reverse().join('.')}`
      const config = (await axios.get<XyoApiEnvelope<XyoDomainPayload>>(requestUrl)).data.data
      return new XyoDomainPayloadWrapper(config)
    } catch (ex) {
      const error = ex as AxiosError
      console.log(`XyoDomainConfig root file not found using proxy [${domain}] [${error.code}]`)
    }
  }

  public static async discoverRootFileDirect(domain: string) {
    try {
      const config = (await axios.get<XyoDomainPayload>(`https://${domain}/xyo-config.json`)).data
      return new XyoDomainPayloadWrapper(config)
    } catch (ex) {
      console.log(`XyoDomainConfig root file not found [${domain}]`)
    }
  }

  public static async discoverRootFile(domain: string, proxy?: string) {
    return isBrowser() || proxy ? await this.discoverRootFileWithProxy(domain, proxy) : await this.discoverRootFileDirect(domain)
  }

  public static async discoverDNSEntry(domain: string) {
    try {
      const hash = (await domainResolve(`_xyo.${domain}`, DnsRecordType.TXT))?.Answer?.[0]?.data
      if (hash) {
        const huri = new Huri(hash)
        const payload = (await huri.fetch()) as XyoDomainPayload
        if (payload) {
          return new XyoDomainPayloadWrapper(payload)
        }
      }
    } catch (ex) {
      console.log(`XyoDomainConfig dns reading error entry not found [${domain}]`)
    }
  }

  public static async discover(reverseDomainName: string, proxy?: string) {
    const parts = reverseDomainName.split('.')
    for (let i = 2; i <= parts.length; i++) {
      const domainToCheck = reverse(parts.filter((_, index) => index < i)).join('.')
      return (await this.discoverDNSEntry(domainToCheck)) ?? (await this.discoverRootFile(domainToCheck, proxy))
    }
  }
}

/** @deprecated use XyoDomainPayloadWrapper instead */
export type XyoDomainConfigWrapper = XyoDomainPayloadWrapper
