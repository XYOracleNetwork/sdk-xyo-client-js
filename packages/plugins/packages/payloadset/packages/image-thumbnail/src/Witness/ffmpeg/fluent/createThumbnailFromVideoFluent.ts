import ffmpeg from 'fluent-ffmpeg'
import { Readable, Writable } from 'stream'

/**
 * Execute FFmpeg using fluent API with provided input buffer and video thumbnail image.
 * @param videoBuffer Input video buffer.
 * @returns Output buffer containing the video thumbnail image.
 */
export const createThumbnailFromVideoFluent = async (videoBuffer: Buffer) => {
  const imageBuffer = await new Promise<Buffer>((resolve, reject) => {
    // const videoStream = new PassThrough()
    // videoStream.end(videoBuffer)

    const videoStream = new Readable()
    videoStream._read = () => {} // _read is required but you can noop it
    videoStream.push(videoBuffer)
    videoStream.push(null)

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
      .input(videoStream)
      .takeFrames(1)
      .withNoAudio()
      // Exactly as their docs but does not work
      // .setStartTime('00:00:00')
      // .seekInput(0)
      .on('error', (err) => reject(err.message))
      // Listen for the 'end' event to combine the chunks and create a PNG buffer
      .on('end', () => resolve(Buffer.concat(pngChunks)))
      .on('data', (chunk) => pngChunks.push(chunk))
      // .toFormat('png')
      .outputOptions('-f image2pipe')
    // .outputOptions('-vcodec png')
    // .output(writableStream, { end: true })

    // Start processing
    command.pipe(writableStream)
  })
  return imageBuffer
}
