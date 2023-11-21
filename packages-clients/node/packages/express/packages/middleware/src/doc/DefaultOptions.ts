import { SwaggerOptions } from 'swagger-ui-express'

export const defaultOptions: SwaggerOptions = {
  basePath: '',
  components: {},
  consumes: ['application/json'],
  definitions: {},
  host: '',
  info: {
    description: 'API for querying Modules in the Node',
    title: 'XYO Node API',
    version: '2.0',
  },
  produces: ['application/json'],
  schemes: ['http', 'https'],
  securityDefinitions: {},
  tags: [
    {
      description: 'Check the health of the Node',
      name: 'Health',
    },
    {
      description: 'View metrics of the Node',
      name: 'Metrics',
    },
  ],
}
