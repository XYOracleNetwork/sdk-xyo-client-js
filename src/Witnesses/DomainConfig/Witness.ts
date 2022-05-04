import { XyoWitness } from '../../core'
import { XyoDomainConfig } from '../../domain'

export class XyoDomainConfigWitness extends XyoWitness<XyoDomainConfig> {
  public static schema: XyoDomainConfig['schema'] = 'network.xyo.domain'
  public static demarkKey = '_xyo'

  constructor() {
    super({
      schema: XyoDomainConfigWitness.schema,
    })
  }

  public static generateDemark(domain: string) {
    return `${XyoDomainConfigWitness.demarkKey}.${domain}`
  }

  public static template: XyoDomainConfig = {
    aliases: [
      {
        huri: '',
        name: '',
      },
    ],
    networks: [
      {
        name: '',
        nodes: [
          {
            name: '',
            slug: '',
            type: 'archivist',
            uri: '',
          },
        ],
        slug: '',
      },
    ],
    schema: this.schema,
  }
}
