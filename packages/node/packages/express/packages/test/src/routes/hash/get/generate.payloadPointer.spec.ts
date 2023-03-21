import { Account } from '@xyo-network/account'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { PayloadAddressRule, PayloadArchiveRule, PayloadPointerBody, PayloadPointerSchema, PayloadSchemaRule } from '@xyo-network/node-core-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'

const gasSchemas = [
  'network.xyo.blockchain.ethereum.gas.ethgasstation',
  'network.xyo.blockchain.ethereum.gas.etherchain.v2',
  'network.xyo.blockchain.ethereum.gas.etherscan',
  'network.xyo.blockchain.ethereum.gas.blocknative',
  'network.xyo.blockchain.ethereum.gas.ethers',
  'network.xyo.blockchain.ethereum.gas',
]
const assetSchemas = ['network.xyo.crypto.market.uniswap', 'network.xyo.crypto.market.coingecko', 'network.xyo.crypto.asset']

describe.skip('Generation of automation payload pointers', () => {
  it.each([...gasSchemas, ...assetSchemas])('Generates automation witness payload for %s schema', (schema) => {
    const addressRule: PayloadAddressRule = { address: '1d8cb128afeed493e0c3d9de7bfc415aecfde283' } // Beta
    // const addressRule: PayloadAddressRule = { address: '4618fce2a84b9cbc64bb07f7249caa6df2a892c7' } // Prod
    const archiveRule: PayloadArchiveRule = { archive: 'crypto-price-witness' }
    const schemaRule: PayloadSchemaRule = { schema }
    const fields: PayloadPointerBody = { reference: [[addressRule], [archiveRule], [schemaRule]], schema: PayloadPointerSchema }
    const payload = new PayloadBuilder<PayloadPointerBody>({ schema: PayloadPointerSchema }).fields(fields).build()
    const bw = new BoundWitnessBuilder({ inlinePayloads: true }).witness(Account.random()).payload(payload).build()
    console.log(`==== ${schema} ====`)
    console.log(JSON.stringify(bw, undefined, 2))
    console.log('===========================================')
  })
})
