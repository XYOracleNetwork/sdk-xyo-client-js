import { assertEx } from '@xylabs/assert'
import { getDefaultLogger } from '@xylabs/sdk-api-express-ecs'
import { DivinerWrapper } from '@xyo-network/diviner-wrapper'
import { XyoEthereumGasSchema } from '@xyo-network/gas-price-payload-plugin'
import { Task } from '@xyo-network/shared'

import { getDiviner } from './getDiviner'
import { reportDivinerResult } from './reportDivinerResult'
import { reportGasPrices } from './reportGasPrices'

export const getTask = (): Task => {
  const logger = getDefaultLogger()
  const task: Task = async () => {
    try {
      logger.log('Witnessing Ethereum Gas Prices')
      const payloads = await reportGasPrices()
      logger.log('Witnessed Ethereum Gas Prices')
      logger.log('Divining Aggregated Gas Price')
      const diviner = await getDiviner()
      const results = await new DivinerWrapper({ module: diviner }).divine(payloads)
      const result = results.find((p) => p.schema === XyoEthereumGasSchema)
      const answer = assertEx(result, 'Empty XyoEthereumGasPayload response from diviner')
      logger.log('Divined Aggregated Gas Price')
      logger.log('Witnessing Aggregated Gas Price')
      await reportDivinerResult(answer)
      logger.log('Witnessed Aggregated Gas Price')
    } catch (error) {
      logger.error(error)
    }
  }
  return task
}
