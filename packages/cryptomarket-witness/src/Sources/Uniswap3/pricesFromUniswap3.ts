import { ChainId, Fetcher, Route, Token, WETH } from '@uniswap/sdk'

import { XyoCryptoAssets } from '../../XyoCryptoAssets'

const DAI = new Token(ChainId.MAINNET, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18)
const XYO = new Token(ChainId.MAINNET, '0xd8C7031DA609a6E201E038DD11c97d7f26f1D572', 18)

export const pricesFromUniswap3 = async () => {
  const pair = await Fetcher.fetchPairData(XYO, WETH[XYO.chainId])

  const route = new Route([pair], WETH[DAI.chainId])

  console.log(route.midPrice.toSignificant(6))
  console.log(route.midPrice.invert().toSignificant(6))

  const assets: XyoCryptoAssets = {}

  return assets
}
