import { ArchivistInstance, asArchivistInstance } from '@xyo-network/archivist-model'
import { HttpBridge, HttpBridgeConfigSchema } from '@xyo-network/http-bridge'
import { PayloadAddressRule, PayloadPointerPayload, PayloadPointerSchema, PayloadSchemaRule } from '@xyo-network/node-core-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

type DappInfo = [schema: string, address: string]

const beta = true

const betaDapps: DappInfo[] = [
  ['network.xyo.blockchain.ethereum.gas', '85e7a0494c1feb184a80d64aca7bef07d8efd960'],
  ['network.xyo.crypto.asset', 'f90b9ad30ea94d3df17d51c727c416b46faf18b6'],
  ['network.xyo.crypto.market.uniswap', '2d0fb5708b9d68bfaa96c6e426cbc66a341f117d'],
]
const prodDapps: DappInfo[] = [
  ['network.xyo.blockchain.ethereum.gas', '5b1037aa01cbba864f0908a7916b6c1de2f2be20'],
  ['network.xyo.crypto.asset', 'fce4ff8050a80076d2f95b77c61c847ae0d8b77f'],
  ['network.xyo.crypto.market.uniswap', 'd6ceab805cd617bb5b1ce86d11f24aae8ec7e26f'],
]

const cases = beta ? betaDapps : prodDapps
const nodeUrl = beta ? 'https://beta.api.archivist.xyo.network' : 'https://api.archivist.xyo.network'

describe.skip('Generation of automation payload pointers', () => {
  let archivist: ArchivistInstance
  beforeAll(async () => {
    const schema = HttpBridgeConfigSchema
    const security = { allowAnonymous: true }
    const bridge = await HttpBridge.create({ config: { nodeUrl, schema, security } })
    const modules = await bridge.resolve({ name: ['Archivist'] })
    const module = modules.pop()
    expect(module).toBeDefined()
    archivist = asArchivistInstance(module, 'Failed to cast module')
  })
  it.each(cases)('Generates automation witness payload for %s schema', async (schema, address) => {
    const addressRule: PayloadAddressRule = { address }
    const schemaRule: PayloadSchemaRule = { schema }
    const fields = { reference: [[addressRule], [schemaRule]], schema: PayloadPointerSchema }
    const payload = await new PayloadBuilder<PayloadPointerPayload>({ schema: PayloadPointerSchema }).fields(fields).build()
    await archivist.insert([payload])
    const hash = await PayloadWrapper.hashAsync(payload)
    const url = `${nodeUrl}/${hash}`
    console.log(`Dapp: ${schema} Pointer: ${url}`)
  })
})
