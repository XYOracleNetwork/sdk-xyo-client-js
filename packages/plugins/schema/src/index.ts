import { XyoSchemaPayload } from '@xyo-network/payload'
import { createXyoPayloadPlugin, XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'
import { XyoSchemaWitness } from '@xyo-network/schema-witness'

const plugin: XyoPayloadPluginFunc<'network.xyo.schema', XyoSchemaPayload> = () =>
  createXyoPayloadPlugin({
    schema: 'network.xyo.schema',
    witness: (): XyoSchemaWitness => {
      return new XyoSchemaWitness()
    },
  })

// eslint-disable-next-line import/no-default-export
export default plugin
