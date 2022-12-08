import { clearLogs } from './logs'
import { start } from './start'
import { stop } from './stop'

export const restart = async () => {
  await stop()
  await clearLogs()
  return start()
}
