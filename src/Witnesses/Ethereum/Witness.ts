import { Web3Provider } from '@ethersproject/providers'
import { assertEx, EthAddress } from '@xylabs/sdk-js'
import { XyoErc20Wrapper } from '@xyo-network/sdk-xyoworld-js'

import { XyoWitness } from '../../core'
import { XyoEthereumAccountPayload, XyoEthereumErc20AccountPayload, XyoEthereumPayload } from './Payload'

export class XyoEthereumWitness<T extends XyoEthereumPayload = XyoEthereumPayload> extends XyoWitness<T> {
  private network: number
  constructor({ network, schema = XyoEthereumWitness.schema }: { network: number; schema: string }) {
    super({
      schema,
    })
    this.network = network
  }

  override async observe(fields?: Partial<T>): Promise<T> {
    const provider = new Web3Provider(window.ethereum)
    const blockNumber = await provider.getBlockNumber()
    return await super.observe({ ...fields, ...({ blockNumber, network: this.network, timestamp: Date.now() } as T) })
  }

  public static schema = 'network.xyo.blockchain.ethereum'
}

export class XyoEthereumAccountWitness<T extends XyoEthereumAccountPayload = XyoEthereumAccountPayload> extends XyoEthereumWitness<XyoEthereumAccountPayload> {
  protected address: string
  constructor({ network, address, schema = XyoEthereumAccountWitness.schema }: { network: number; address: string; schema: string }) {
    super({ network, schema })
    this.address = address
  }

  override async observe(fields?: Partial<T>): Promise<T> {
    const provider = new Web3Provider(window.ethereum)
    const balance = await provider.getBalance(this.address)
    return (await super.observe({ ...fields, ...{ account: { address: this.address, balance: balance.toHexString() } } })) as T
  }

  public static schema = 'network.xyo.blockchain.ethereum.account'
}

export class XyoEthereumErc20AccountWitness<
  T extends XyoEthereumErc20AccountPayload = XyoEthereumErc20AccountPayload
> extends XyoEthereumAccountWitness<XyoEthereumErc20AccountPayload> {
  protected contract: string
  constructor({ contract, network, address, schema = XyoEthereumAccountWitness.schema }: { contract: string; network: number; address: string; schema: string }) {
    super({ address, network, schema })
    this.contract = contract
  }

  override async observe(fields?: Partial<T>): Promise<T> {
    const provider = new Web3Provider(window.ethereum)
    const ethContract = assertEx(EthAddress.fromString(this.contract), 'Bad Contract')
    const ethAddress = assertEx(EthAddress.fromString(this.address), 'Bad Address')
    const erc20 = new XyoErc20Wrapper(ethContract, provider)
    const balance = await erc20.getBalance(ethAddress)
    return (await super.observe({ ...fields, ...{ account: { address: this.address, balance: balance.toString('hex') }, contract: this.contract } })) as T
  }

  public static schema = 'network.xyo.blockchain.ethereum.account'
}
