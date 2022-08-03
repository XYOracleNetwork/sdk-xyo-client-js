import { XyoDomainPayload, XyoDomainWitness } from '@xyo-network/domain'
import { createXyoPayloadPlugin, XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'

const plugin: XyoPayloadPluginFunc<'network.xyo.domain', XyoDomainPayload> = () =>
  createXyoPayloadPlugin({
    schema: 'network.xyo.domain',
    witness: (): XyoDomainWitness => {
      return new XyoDomainWitness()
    },
  })

// eslint-disable-next-line import/no-default-export
export default plugin
