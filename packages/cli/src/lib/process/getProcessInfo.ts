import { isRunning } from './isRunning'
import { errFile, outFile } from './logs'
import { getPid } from './pid'

export interface NodeInfo {
  logs: {
    stderr: string
    stdout: string
  }
  pid?: number
}

const logs = {
  stderr: errFile,
  stdout: outFile,
}

export const getProcessInfo = async (): Promise<NodeInfo | undefined> => {
  if (await isRunning()) {
    const pid = await getPid()
    if (pid) {
      return { logs, pid }
    }
  }
  return { logs }
}
