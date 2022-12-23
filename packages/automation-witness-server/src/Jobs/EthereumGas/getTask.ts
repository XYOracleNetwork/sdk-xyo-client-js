import { assertEx } from '@xylabs/assert'
import { getDefaultLogger } from '@xylabs/sdk-api-express-ecs'
import { DivinerWrapper } from '@xyo-network/diviner-wrapper'
import { XyoEthereumGasSchema } from '@xyo-network/gas-price-payload-plugin'
import { Task } from '@xyo-network/shared'

import { getDiviner } from './getDiviner'
import { getDivinerResultPanel } from './getDivinerResultPanel'
import { getWitnessPanel } from './getWitnessPanel'

export const getTask = (): Task => {
  const logger = getDefaultLogger()
  const task: Task = async () => {
    try {
      logger.log('Witnessing Ethereum Gas Prices')
      const witnessPanel = await getWitnessPanel()
      const [, payloads] = await witnessPanel.report()
      logger.log('Witnessed Ethereum Gas Prices')
      logger.log('Divining Aggregated Gas Price')
      const diviner = await getDiviner()
      const result = (await new DivinerWrapper(diviner).divine(payloads)).find((p) => p.schema === XyoEthereumGasSchema)
      const answer = assertEx(result, 'Empty XyoEthereumGasPayload response from diviner')
      logger.log('Divined Aggregated Gas Price')
      logger.log('Witnessing Aggregated Gas Price')
      const divinerResultPanel = await getDivinerResultPanel(answer)
      await divinerResultPanel.report()
      logger.log('Witnessed Aggregated Gas Price')
    } catch (error) {
      logger.error(error)
    }
  }
  return task
}
