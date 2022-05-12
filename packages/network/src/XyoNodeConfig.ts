export type XyoNodeType = 'archivist' | 'diviner' | 'bridge' | 'sentinel'

export interface XyoNodeConfig {
  type: XyoNodeType
  slug: string
  name: string
  uri: string
  web?: string
  docs?: string
}
