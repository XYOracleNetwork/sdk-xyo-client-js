import { assertEx } from '@xylabs/assert'
import { getDefaultLogger } from '@xylabs/sdk-api-express-ecs'
import { EthereumGasSchema } from '@xyo-network/gas-price-payload-plugin'
import { Task } from '@xyo-network/shared'

import { getDiviner } from './getDiviner'
import { reportDivinerResult } from './reportDivinerResult'
import { reportGasPrices } from './reportGasPrices'

export const getTask = (): Task => {
  const logger = getDefaultLogger()
  const task: Task = async () => {
    try {
      logger.log('Reporting Ethereum Gas Prices')
      const payloads = await reportGasPrices()
      logger.log('Reported Ethereum Gas Prices')
      logger.log('Divining Aggregated Gas Price')
      const diviner = await getDiviner()
      const results = await diviner.divine(payloads)
      const result = results.find((p) => p.schema === EthereumGasSchema)
      const answer = assertEx(result, 'Empty EthereumGasPayload response from diviner')
      logger.log('Divined Aggregated Gas Price')
      logger.log('Reporting Aggregated Gas Price')
      await reportDivinerResult(answer)
      logger.log('Reported Aggregated Gas Price')
    } catch (error) {
      logger.error(error)
    }
  }
  return task
}
