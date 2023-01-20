type AutogenType = (outputFile: string, endpointsFiles: string[], data?: Record<string, unknown>) => Promise<void>

declare module 'swagger-autogen' {
  declare function swaggerAutogen(): AutogenType
  export = swaggerAutogen
}
