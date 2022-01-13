import { expect } from 'aegir/utils/chai.js'
import BufferList from 'bl/BufferList.js'
import { reader } from '../src/index.js'
import randomBytes from 'iso-random-stream/src/random.js'

describe('it-reader', () => {
  it('should read from source with too big first chunk', async () => {
    const input = [randomBytes(16)]
    const stream = reader(input)
    const { value, done } = await stream.next(8)
    expect(done).to.be.false()

    if (value == null) {
      throw new Error('Value was not ok')
    }

    expect(input[0].slice(0, 8)).to.deep.equal(value.slice())
  })

  it('should read from source with exact first chunk', async () => {
    const input = [randomBytes(8)]
    const stream = reader(input)
    let res

    res = await stream.next(8)
    expect(res.done).to.be.false()

    if (res.value == null) {
      throw new Error('Value was not ok')
    }

    expect(input[0].slice(0, 8)).to.deep.equal(res.value.slice())

    res = await stream.next()
    expect(res.done).to.be.true()
    expect(res.value).to.not.be.ok()
  })

  it('should read from source with too small first chunk and too big second', async () => {
    const input = [randomBytes(4), randomBytes(8)]
    const stream = reader(input)
    let res

    res = await stream.next(8)
    expect(res.done).to.be.false()

    if (res.value == null) {
      throw new Error('Value was not ok')
    }

    expect(new BufferList(input).slice(0, 8)).to.deep.equal(res.value.slice())

    res = await stream.next()
    expect(res.done).to.be.false()

    if (res.value == null) {
      throw new Error('Value was not ok')
    }

    expect(new BufferList(input).slice(8)).to.deep.equal(res.value.slice())

    res = await stream.next()
    expect(res.done).to.be.true()
    expect(res.value).to.not.be.ok()
  })

  it('should read from source with too small first chunk and exact second', async () => {
    const input = [randomBytes(4), randomBytes(4)]
    const stream = reader(input)
    let res

    res = await stream.next(8)
    expect(res.done).to.be.false()

    if (res.value == null) {
      throw new Error('Value was not ok')
    }

    expect(new BufferList(input).slice(0, 8)).to.deep.equal(res.value.slice())

    res = await stream.next()
    expect(res.done).to.be.true()
    expect(res.value).to.not.be.ok()
  })

  it('should read bytes twice with exact first chunk', async () => {
    const input = [randomBytes(16)]
    const stream = reader(input)
    let res

    res = await stream.next(8)
    expect(res.done).to.be.false()

    if (res.value == null) {
      throw new Error('Value was not ok')
    }

    expect(new BufferList(input).slice(0, 8)).to.deep.equal(res.value.slice())

    res = await stream.next(8)
    expect(res.done).to.be.false()

    if (res.value == null) {
      throw new Error('Value was not ok')
    }

    expect(new BufferList(input).slice(8, 16)).to.deep.equal(res.value.slice())

    res = await stream.next()
    expect(res.done).to.be.true()
    expect(res.value).to.not.be.ok()
  })

  it('should read bytes twice with too big first chunk and exact second chunk', async () => {
    const input = [randomBytes(12), randomBytes(4)]
    const stream = reader(input)
    let res

    res = await stream.next(8)
    expect(res.done).to.be.false()

    if (res.value == null) {
      throw new Error('Value was not ok')
    }

    expect(new BufferList(input).slice(0, 8)).to.deep.equal(res.value.slice())

    res = await stream.next(8)
    expect(res.done).to.be.false()

    if (res.value == null) {
      throw new Error('Value was not ok')
    }

    expect(new BufferList(input).slice(8, 16)).to.deep.equal(res.value.slice())

    res = await stream.next()
    expect(res.done).to.be.true()
    expect(res.value).to.not.be.ok()
  })

  it('should read bytes twice with too small first chunk and exact second chunk', async () => {
    const input = [randomBytes(4), randomBytes(12)]
    const stream = reader(input)
    let res

    res = await stream.next(8)
    expect(res.done).to.be.false()

    if (res.value == null) {
      throw new Error('Value was not ok')
    }

    expect(new BufferList(input).slice(0, 8)).to.deep.equal(res.value.slice())

    res = await stream.next(8)
    expect(res.done).to.be.false()

    if (res.value == null) {
      throw new Error('Value was not ok')
    }

    expect(new BufferList(input).slice(8, 16)).to.deep.equal(res.value.slice())

    res = await stream.next()
    expect(res.done).to.be.true()
    expect(res.value).to.not.be.ok()
  })

  it('should read bytes twice with too big first chunk and too big second chunk', async () => {
    const input = [randomBytes(9), randomBytes(12)]
    const stream = reader(input)
    let res

    res = await stream.next(8)
    expect(res.done).to.be.false()

    if (res.value == null) {
      throw new Error('Value was not ok')
    }

    expect(new BufferList(input).slice(0, 8)).to.deep.equal(res.value.slice())

    res = await stream.next(8)
    expect(res.done).to.be.false()

    if (res.value == null) {
      throw new Error('Value was not ok')
    }

    expect(new BufferList(input).slice(8, 16)).to.deep.equal(res.value.slice())

    res = await stream.next()
    expect(res.done).to.be.false()

    if (res.value == null) {
      throw new Error('Value was not ok')
    }

    expect(new BufferList(input).slice(16)).to.deep.equal(res.value.slice())

    res = await stream.next()
    expect(res.done).to.be.true()
    expect(res.value).to.not.be.ok()
  })

  it('should read from source and consume rest', async () => {
    const input = [randomBytes(32), randomBytes(3), randomBytes(6)]
    const stream = reader(input)
    const res = await stream.next(8)

    expect(res.done).to.be.false()

    if (res.value == null) {
      throw new Error('Value was not ok')
    }

    expect(new BufferList(input).slice(0, 8)).to.deep.equal(res.value.slice())

    const output = []
    for await (const chunk of stream) {
      output.push(chunk)
    }

    if (res.value == null) {
      throw new Error('Value was not ok')
    }

    expect(new BufferList(input).slice(8)).to.deep.equal(new BufferList(output).slice())
  })

  it('should throw when source ends before read completes', async () => {
    const input = [randomBytes(4)]
    const stream = reader(input)

    await expect(stream.next(8))
      .to.eventually.be.rejected.with.property('code', 'ERR_UNDER_READ')
  })

  it('should expose bytes read so far for under read', async () => {
    const input = [randomBytes(4)]
    const stream = reader(input)

    await expect(stream.next(8))
      .to.eventually.be.rejected.with.property('buffer').that.deep.equals(new BufferList(input[0].slice(0, 4)))
  })
})
