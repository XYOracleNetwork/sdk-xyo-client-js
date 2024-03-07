import { JsonValue } from '@xylabs/object'

import { Manifest } from './Manifest'

export interface ConfigManifest<S extends string = string> extends Manifest {
  [name: string]: JsonValue | undefined
  accountPath?: string
  name: string
  schema: S
}
