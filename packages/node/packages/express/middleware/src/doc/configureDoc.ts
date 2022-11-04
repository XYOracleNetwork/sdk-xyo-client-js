import { Application } from 'express'
import swaggerAutogen from 'swagger-autogen'
// eslint-disable-next-line import/no-deprecated
import { serve, setup } from 'swagger-ui-express'

import { ConfigureDocOptions } from './ConfigureDocOptions'
import { defaultOptions } from './DefaultOptions'

const swaggerJsonFile = 'swagger.json'
const swaggerJsonUrl = `/doc/${swaggerJsonFile}`
const endpointsFiles = ['{src,dist}/**/*.{ts,js}']

const uiOptions = {
  swaggerOptions: {
    apiSorter: 'alpha',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    operationsSorter: function (a: any, b: any) {
      const order: Record<string, string> = { delete: '3', get: '0', post: '1', put: '2' }
      return order[a.get('method')].localeCompare(order[b.get('method')])
    },
    tagsSorter: 'alpha',
    url: swaggerJsonUrl,
  },
}

export const configureDoc = async (app: Application, options: ConfigureDocOptions) => {
  app.get(swaggerJsonUrl, (req, res) => res.sendFile(swaggerJsonFile, { root: './' }))
  const schemes = options.host.includes('localhost') ? ['http'] : ['https']
  const mergedOptions = { ...defaultOptions, ...options, schemes }
  await swaggerAutogen()(swaggerJsonFile, endpointsFiles, mergedOptions)

  // eslint-disable-next-line import/no-deprecated
  app.use('/doc', serve, setup(undefined, uiOptions))
}
