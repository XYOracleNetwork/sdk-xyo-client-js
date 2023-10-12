import { NameOrAddress } from '@xyo-network/module-model'

export interface SentinelTask {
  /** @field determines what inputs are sent to each witness */
  input?: boolean | string
  /** @field the modules that performs the task */
  module: NameOrAddress
}
