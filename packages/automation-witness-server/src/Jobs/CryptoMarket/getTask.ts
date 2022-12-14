import { assertEx } from '@xylabs/assert'
import { getDefaultLogger } from '@xylabs/sdk-api-express-ecs'
import { XyoCryptoMarketAssetSchema } from '@xyo-network/crypto-asset-payload-plugin'
import { DivinerWrapper } from '@xyo-network/diviner'
import { Task } from '@xyo-network/shared'

import { getDiviner } from './getDiviner'
import { getDivinerResultPanel } from './getDivinerResultPanel'
import { getWitnessPanel } from './getWitnessPanel'

export const getTask = (): Task => {
  const logger = getDefaultLogger()
  const task: Task = async () => {
    try {
      logger.log('Witnessing Crypto Prices')
      const witnessPanel = await getWitnessPanel()
      const [, payloads] = await witnessPanel.report()
      logger.log('Witnessed Crypto Prices')
      logger.log('Divining Aggregated Crypto Prices')
      const diviner = await getDiviner()
      const result = (await new DivinerWrapper(diviner).divine(payloads)).find((p) => p.schema === XyoCryptoMarketAssetSchema)
      const answer = assertEx(result, 'Empty XyoCryptoMarketAssetPayload response from diviner')
      logger.log('Divined Aggregated Crypto Prices')
      logger.log('Witnessing Aggregated Crypto Prices')
      const divinerResultPanel = await getDivinerResultPanel(answer)
      await divinerResultPanel.report()
      logger.log('Witnessed Aggregated Crypto Prices')
    } catch (error) {
      logger.error(error)
    }
  }
  return task
}
