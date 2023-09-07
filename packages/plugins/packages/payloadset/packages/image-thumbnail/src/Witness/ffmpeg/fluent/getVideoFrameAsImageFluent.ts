import { uuid } from '@xyo-network/core'
import ffmpeg from 'fluent-ffmpeg'
import { unlink, writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import { Writable } from 'stream'
/**
 * Execute FFmpeg using fluent API with provided input buffer and video thumbnail image.
 * @param videoBuffer Input video buffer.
 * @returns Output buffer containing the video thumbnail image.
 */
export const getVideoFrameAsImageFluent = async (videoBuffer: Buffer) => {
  const tmpFile = `/${tmpdir()}/${uuid()}.mp4`
  try {
    await writeFile(tmpFile, videoBuffer, { encoding: 'binary' })
    const imageBuffer = await new Promise<Buffer>((resolve, reject) => {
      // Initialize empty array to collect PNG chunks
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pngChunks: any[] = []

      // Create a Writable stream to collect PNG output from ffmpeg
      const writableStream = new Writable({
        write(chunk, encoding, callback) {
          pngChunks.push(chunk)
          callback()
        },
      })

      const command = ffmpeg()
        // Uncomment to debug CLI args to ffmpeg
        // .on('start', (commandLine) => console.log('Spawned Ffmpeg with command: ' + commandLine))
        .on('error', (err) => reject(err.message))
        // Listen for the 'end' event to combine the chunks and create a PNG buffer
        .on('end', () => resolve(Buffer.concat(pngChunks)))
        .input(tmpFile)
        .takeFrames(1)
        .withNoAudio()
        .outputOptions('-f image2pipe')
        .videoCodec('png')

      // Start processing
      command.pipe(writableStream)
    })
    return imageBuffer
  } finally {
    // Temp file cleanup
    try {
      await unlink(tmpFile)
    } catch {
      // No error here since file doesn't exist
    }
  }
}
