import { EthersUniswapV3Slot0Fields } from './UniswapV3Slot0Fields'

export class EthersUniswap3PoolSlot0Wrapper {
  protected values: EthersUniswapV3Slot0Fields
  constructor(values: EthersUniswapV3Slot0Fields) {
    this.values = values
  }

  get feeProtocol() {
    return this.values[5]
  }

  get observationCardinality() {
    return this.values[3]
  }

  get observationCardinalityNext() {
    return this.values[4]
  }

  get observationIndex() {
    return this.values[2]
  }

  get sqrtPriceX96() {
    return this.values[0]
  }

  get tick() {
    return this.values[1]
  }

  get unlocked() {
    return this.values[6]
  }
}
