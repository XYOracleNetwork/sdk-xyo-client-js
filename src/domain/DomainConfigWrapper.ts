import axios, { AxiosError } from 'axios'
import reverse from 'lodash/reverse'

import { XyoApiEnvelope } from '../Api'
import { Huri, HuriOptions, XyoFetchedPayload, XyoPayloadWrapper } from '../core'
import { DnsRecordType, domainResolve, isBrowser } from '../lib'
import { XyoNetworkConfig } from '../network'
import { XyoAlias, XyoDomainConfig } from './DomainConfig'

export class XyoDomainConfigWrapper extends XyoPayloadWrapper<XyoDomainConfig> {
  public aliases?: XyoFetchedPayload[] | null

  private getNetwork(slug?: string): XyoNetworkConfig | undefined {
    return slug ? this.payload.networks?.find((value) => value.slug === slug) : this.payload.networks?.[0]
  }

  private findArchivistUri(networkSlug?: string): string | undefined {
    return this.getNetwork(networkSlug)?.nodes.find((value) => value.type === 'archivist')?.uri
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
        this.payload.aliases?.map((alias) => {
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
      const config = (await axios.get<XyoApiEnvelope<XyoDomainConfig>>(requestUrl)).data.data
      return new XyoDomainConfigWrapper(config)
    } catch (ex) {
      console.log(ex)
      const error = ex as AxiosError
      console.log(`XyoDomainConfig root file not found using proxy [${domain}] [${error.code}]`)
    }
  }

  public static async discoverRootFileDirect(domain: string) {
    try {
      const config = (await axios.get<XyoDomainConfig>(`https://${domain}/xyo-config.json`)).data
      return new XyoDomainConfigWrapper(config)
    } catch (ex) {
      console.log(`XyoDomainConfig root file not found [${domain}]`)
    }
  }

  public static async discoverRootFile(domain: string, proxy?: string) {
    return isBrowser() ? await this.discoverRootFileWithProxy(domain, proxy) : await this.discoverRootFileDirect(domain)
  }

  public static async discoverDNSEntry(domain: string) {
    try {
      const hash = (await domainResolve(`_xyo.${domain}`, DnsRecordType.TXT))?.Answer?.[0]?.data
      if (hash) {
        const huri = new Huri(hash)
        const payload = (await huri.fetch()) as XyoDomainConfig
        if (payload) {
          return new XyoDomainConfigWrapper(payload)
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
