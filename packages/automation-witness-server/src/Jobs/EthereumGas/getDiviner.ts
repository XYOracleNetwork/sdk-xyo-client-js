import { XyoEthereumGasDiviner, XyoEthereumGasDivinerConfigSchema } from '@xyo-network/gas-price-plugin'

import { getAccount } from '../../Account'

export const getDiviner = async (): Promise<XyoEthereumGasDiviner> => {
  return await XyoEthereumGasDiviner.create({
    account: getAccount(),
    config: {
      schema: XyoEthereumGasDivinerConfigSchema,
    },
  })
}
