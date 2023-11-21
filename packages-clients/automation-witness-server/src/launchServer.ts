import { tryParseInt } from '@xylabs/sdk-api-express-ecs'
import { config } from 'dotenv'

import { server } from './Server'

config()

void server(tryParseInt(process.env.APP_PORT))
