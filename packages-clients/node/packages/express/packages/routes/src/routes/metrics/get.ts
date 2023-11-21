import { assertEx } from '@xylabs/assert'
import { asyncHandler, NoReqParams } from '@xylabs/sdk-api-express-ecs'
import { setRawResponseFormat } from '@xyo-network/express-node-middleware'
import { TYPES } from '@xyo-network/node-core-types'
import { PrometheusNodeWitness } from '@xyo-network/prometheus-node-plugin'
import { RequestHandler } from 'express'

const descriptionErrorMsg = 'Unable to resolve PrometheusWitness description'
const resolutionErrorMsg = 'Unable to resolve PrometheusNodeWitness'

const handler: RequestHandler<NoReqParams> = async (req, res) => {
  setRawResponseFormat(res)
  const { node } = req.app
  const name = [assertEx(TYPES.PrometheusWitness.description, descriptionErrorMsg)]
  const modules = await node.resolve({ name }, { direction: 'down' })
  const Prometheus = assertEx(modules.pop() as PrometheusNodeWitness, resolutionErrorMsg)
  res.contentType(Prometheus.registry.contentType)
  res.end(await Prometheus.registry.metrics())
}

export const getMetrics = asyncHandler(handler)
