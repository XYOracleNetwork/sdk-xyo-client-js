import { config } from 'dotenv'
config()
import { tryParseInt } from '@xylabs/sdk-api-express-ecs'
import { server } from '@xyo-network/express-node'

void server(tryParseInt(process.env.APP_PORT))
