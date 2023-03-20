import { asyncHandler, NoReqParams } from '@xylabs/sdk-api-express-ecs'
import { setRawResponseFormat } from '@xyo-network/express-node-middleware'
import { RequestHandler } from 'express'

const handler: RequestHandler<NoReqParams> = async (req, res) => {
  setRawResponseFormat(res)
  const { prometheusNodeWitness: Prometheus } = req.app
  res.contentType(Prometheus.registry.contentType)
  res.end(await Prometheus.registry.metrics())
}

export const getMetrics = asyncHandler(handler)
