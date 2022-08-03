import { createXyoPayloadPlugin, XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'
import { XyoLocationPayload, XyoLocationWitness } from '@xyo-network/witnesses'

const plugin: XyoPayloadPluginFunc<'network.xyo.location', XyoLocationPayload> = () =>
  createXyoPayloadPlugin({
    auto: true,
    schema: 'network.xyo.location',
    witness: (): XyoLocationWitness => {
      return new XyoLocationWitness()
    },
  })

// eslint-disable-next-line import/no-default-export
export default plugin
