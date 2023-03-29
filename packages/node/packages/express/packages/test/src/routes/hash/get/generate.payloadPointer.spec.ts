import { ArchivistWrapper } from '@xyo-network/archivist'
import { HttpBridge, HttpBridgeConfigSchema } from '@xyo-network/http-bridge'
import { PayloadAddressRule, PayloadPointerPayload, PayloadPointerSchema, PayloadSchemaRule } from '@xyo-network/node-core-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'

type DappInfo = [schema: string, address: string]

const beta = true

const betaDapps: DappInfo[] = [
  ['network.xyo.blockchain.ethereum.gas', '85e7a0494c1feb184a80d64aca7bef07d8efd960'],
  ['network.xyo.crypto.asset', 'f90b9ad30ea94d3df17d51c727c416b46faf18b6'],
  ['network.xyo.crypto.market.uniswap', '2d0fb5708b9d68bfaa96c6e426cbc66a341f117d'],
]
const prodDapps: DappInfo[] = [
  ['network.xyo.blockchain.ethereum.gas', 'TODO'],
  ['network.xyo.crypto.asset', 'TODO'],
  ['network.xyo.crypto.market.uniswap', 'TODO'],
]

const cases = beta ? betaDapps : prodDapps
const nodeUrl = beta ? 'https://beta.api.archivist.xyo.network' : 'https://api.archivist.xyo.network'

describe.skip('Generation of automation payload pointers', () => {
  let archivist: ArchivistWrapper
  beforeAll(async () => {
    const bridge = await HttpBridge.create({
      config: { nodeUrl, schema: HttpBridgeConfigSchema, security: { allowAnonymous: true } },
    })
    const modules = await bridge.downResolver.resolve({ name: ['Archivist'] })
    const module = modules.pop()
    expect(module).toBeDefined()
    archivist = ArchivistWrapper.wrap(module)
  })
  it.each(cases)('Generates automation witness payload for %s schema', async (schema, address) => {
    const addressRule: PayloadAddressRule = { address }
    const schemaRule: PayloadSchemaRule = { schema }
    const fields = { reference: [[addressRule], [schemaRule]], schema: PayloadPointerSchema }
    const payload = new PayloadBuilder<PayloadPointerPayload>({ schema: PayloadPointerSchema }).fields(fields).build()
    await archivist.insert([payload])
  })
})
