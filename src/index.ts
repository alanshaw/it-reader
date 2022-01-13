import BufferList from 'bl/BufferList.js'
import type { Source } from 'it-stream-types'

export function reader (source: Source<Uint8Array>) {
  const reader = (async function * (): AsyncGenerator<BufferList, void, any> {
    // @ts-expect-error first yield in stream is ignored
    let bytes: number | undefined = yield // Allows us to receive 8 when reader.next(8) is called
    let bl = new BufferList()

    for await (const chunk of source) {
      if (bytes == null) {
        // @ts-expect-error bl types are broken
        bytes = yield bl.append(chunk)
        bl = new BufferList()
        continue
      }

      // @ts-expect-error bl types are broken
      bl.append(chunk)

      while (bl.length >= bytes) {
        const data = bl.shallowSlice(0, bytes)
        bl.consume(bytes)
        bytes = yield data

        // If we no longer want a specific byte length, we yield the rest now
        if (bytes == null) {
          if (bl.length > 0) {
            bytes = yield bl
            bl = new BufferList()
          }
          break // bytes is null and/or no more buffer to yield
        }
      }
    }

    // Consumer wants more bytes but the source has ended and our buffer
    // is not big enough to satisfy.
    if (bytes != null) {
      throw Object.assign(
        new Error(`stream ended before ${bytes} bytes became available`),
        { code: 'ERR_UNDER_READ', buffer: bl }
      )
    }
  })()

  void reader.next()
  return reader
}
