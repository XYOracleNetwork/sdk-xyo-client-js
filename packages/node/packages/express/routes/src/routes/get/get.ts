// import { asyncHandler } from '@xylabs/sdk-api-express-ecs'
import { NoReqParams } from '@xylabs/sdk-api-express-ecs'
import { nodeInfoFromModule } from '@xyo-network/node-core-lib'
import { NodeInfo } from '@xyo-network/node-core-model'
// import { setRawResponseFormat } from '@xyo-network/express-node-middleware'
import { Request, RequestHandler } from 'express'

const nodeDescription: NodeInfo[] = []

let populated = false

// TODO: Handle updates dynamically via Diviner, etc.
// potentially listening to insertion/removal events
const populateNodeDescription = (req: Request) => {
  const { payloadArchivist, boundWitnessArchivist, schemaStatsDiviner, payloadStatsDiviner, boundWitnessStatsDiviner } = req.app
  nodeDescription.push(
    ...[payloadArchivist, boundWitnessArchivist, schemaStatsDiviner, payloadStatsDiviner, boundWitnessStatsDiviner].map(nodeInfoFromModule),
  )
  populated = true
}

const handler: RequestHandler<NoReqParams> = (req, res) => {
  // setRawResponseFormat(res)
  if (!populated) populateNodeDescription(req)
  res.json(nodeDescription)
}

// export const getNode = asyncHandler(handler)
export const getNode = handler
