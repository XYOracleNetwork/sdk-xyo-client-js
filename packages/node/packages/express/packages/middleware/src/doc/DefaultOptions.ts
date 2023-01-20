import { SwaggerOptions } from 'swagger-ui-express'

export const defaultOptions: SwaggerOptions = {
  basePath: '',
  components: {},
  consumes: ['application/json'],
  definitions: {},
  host: '',
  info: {
    description: 'API for storing & retrieving blocks/payloads in the Archivist',
    title: 'XYO Archivist API',
    version: '2.0',
  },
  produces: ['application/json'],
  schemes: ['http', 'https'],
  securityDefinitions: {},
  tags: [
    {
      description: 'Create and manage archives',
      name: 'Archive',
    },
    {
      description: 'Add and query boundwitness blocks',
      name: 'Block',
    },
    {
      description: 'Check the health of the archivist',
      name: 'Health',
    },
    {
      description: 'View metrics of the archivist',
      name: 'Metrics',
    },
    {
      description: 'Add and query payloads',
      name: 'Payload',
    },
    {
      description: 'View data about schemas used in payloads',
      name: 'Schema',
    },
    {
      description: 'Add and query payloads',
      name: 'Payload',
    },
    {
      description: 'Manage user accounts and profiles',
      name: 'User',
    },
  ],
}
