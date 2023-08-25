import { spawn } from 'child_process'
import { PassThrough } from 'stream'

/**
 * Execute FFmpeg with the provided arguments.
 * @param videoBuffer Input video buffer.
 * @param ffmpegArgs FFmpeg arguments.
 * @returns Output buffer containing the video thumbnail image.
 */
export const executeFFmpeg = (videoBuffer: Buffer, ffmpegArgs: string[] = ['-']): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', ['-i', 'pipe:', '-ss', '00:00:00', '-vframes', '1', '-f', 'image2pipe', ...ffmpegArgs])

    // Create a readable stream from the input buffer
    const videoStream = new PassThrough().end(videoBuffer)

    // Pipe the input stream to ffmpeg's stdin
    videoStream.pipe(ffmpeg.stdin)
    const chunks: Buffer[] = []
    ffmpeg.stdout.on('data', (chunk: Buffer) => chunks.push(chunk))
    // TODO: This is required as we're seeing errors thrown due to
    // how we're piping the data to ffmpeg. Works perfectly though.
    ffmpeg.stdin.on('error', () => {})
    ffmpeg.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`FFmpeg exited with code ${code}`))
      }
      resolve(Buffer.concat(chunks))
    })
  })
}
