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
  // Get a temp file name
  const tmpFile = `/${tmpdir()}/${uuid()}.mp4`
  try {
    // Write videoBuffer to temp file for use as input to ffmpeg to
    // avoid issues with ffmpeg inferring premature EOF from buffer
    // passed via stdin (happens when ffmpeg is trying to infer
    // input video format)
    await writeFile(tmpFile, videoBuffer, { encoding: 'binary' })
    const imageBuffer = await new Promise<Buffer>((resolve, reject) => {
      // Initialize empty array to collect PNG chunks
      const pngChunks: Uint8Array[] = []

      // Create a Writable stream to collect PNG output from ffmpeg
      const ffmpegPngOutput = new Writable({
        write(chunk, _encoding, callback) {
          pngChunks.push(chunk)
          callback()
        },
      })

      ffmpeg()
        // NOTE: Uncomment to debug CLI args to ffmpeg
        // .on('start', (commandLine) => console.log('Spawned Ffmpeg with command: ' + commandLine))
        .on('error', (err) => reject(err.message))
        // Listen for the 'end' event to combine the chunks to buffer holding the PNG image
        .on('end', () => resolve(Buffer.concat(pngChunks)))
        .input(tmpFile) // Use temp file as input
        .takeFrames(1) // Only take 1st video frame
        .withNoAudio() // Don't include audio
        .outputOptions('-f image2pipe') // Write output to stdout
        .videoCodec('png') // Force PNG output
        // Start processing and direct ffmpeg stdout to writable stream
        .pipe(ffmpegPngOutput)
    })
    return imageBuffer
  } finally {
    // Cleanup temp file
    try {
      await unlink(tmpFile)
    } catch {
      // No error here since file doesn't exist
    }
  }
}
