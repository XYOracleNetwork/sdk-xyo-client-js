import { ScreenBuffer, terminal, TextBuffer } from 'terminal-kit'

type LoadFunction = (x: string) => Promise<void>

export const printFile = async (path: string) => {
  const sb = new ScreenBuffer({ dst: terminal, height: 25 })
  const text = new TextBuffer({ dst: sb })
  await (text.load as LoadFunction)(path)
  text.draw()
  sb.draw()
}
