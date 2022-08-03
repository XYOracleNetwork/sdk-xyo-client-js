import { createXyoPayloadPlugin, XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'
import { XyoIdPayload, XyoIdWitness } from '@xyo-network/witnesses'

const plugin: XyoPayloadPluginFunc<'network.xyo.id', XyoIdPayload> = () =>
  createXyoPayloadPlugin({
    auto: true,
    schema: 'network.xyo.id',
    witness: (): XyoIdWitness => {
      return new XyoIdWitness()
    },
  })

// eslint-disable-next-line import/no-default-export
export default plugin
