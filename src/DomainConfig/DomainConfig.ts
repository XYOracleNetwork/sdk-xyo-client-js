import axios from 'axios'
import { reverse } from 'lodash-es'

export interface XyoDomainConfig {
  schema?: Record<string, string>
}

export class XyoDomainConfigWrapper {
  public config: XyoDomainConfig
  constructor(config?: XyoDomainConfig) {
    this.config = config ?? {}
  }
  public async discover(reverseDomainName: string) {
    const parts = reverseDomainName.split('.')
    for (let i = 2; i <= parts.length; i++) {
      const domain = reverse(parts.filter((part, index) => index < i)).join('.')
      try {
        this.config = (await axios.get<XyoDomainConfig>(`https://${domain}/xyo-config.json`)).data
        return this.config
      } catch (ex) {
        console.log(`XyoDomainConfig not found [${domain}]`)
      }
    }
  }
}
