import { Query } from '../../Query'

export type ModuleDescribeQuerySchema = 'network.xyo.query.module.describe'
export const ModuleDescribeQuerySchema: ModuleDescribeQuerySchema = 'network.xyo.query.module.describe'

export type ModuleDescribeQuery = Query<{
  schema: ModuleDescribeQuerySchema
}>
