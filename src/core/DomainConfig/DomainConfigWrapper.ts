import axios from 'axios'
import reverse from 'lodash/reverse'

import { Huri } from '../Huri'
import { XyoPayload } from '../Payload'
import { XyoDomainConfig } from './DomainConfig'

export class XyoDomainConfigWrapper {
  public config: XyoDomainConfig
  constructor(config: XyoDomainConfig) {
    this.config = config
  }

  public definitions: XyoPayload[] | undefined

  public async fetch(networkSlug?: string) {
    const network = networkSlug ? this.config.networks?.find((value) => value.slug === networkSlug) : this.config.networks?.[0]
    if (network) {
      const archivistUri = network.nodes.find((value) => value.type === 'archivist')?.uri
      if (archivistUri && this.config.definitions) {
        const payloads = await Promise.all(
          this.config.definitions.map((value) => {
            const huri = new Huri(value)
            return huri.fetch()
          })
        )
        this.definitions = payloads as XyoPayload[]
      }
    }
  }

  public static async discover(reverseDomainName: string) {
    const parts = reverseDomainName.split('.')
    for (let i = 2; i <= parts.length; i++) {
      const domainToCheck = reverse(parts.filter((_, index) => index < i)).join('.')
      try {
        const config = (await axios.get<XyoDomainConfig>(`https://${domainToCheck}/xyo-config.json`)).data
        return new XyoDomainConfigWrapper(config)
      } catch (ex) {
        console.log(`XyoDomainConfig not found [${domainToCheck}]`)
      }
    }
  }
}
