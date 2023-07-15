import { Transform } from 'stream'

// This stream transformer makes it safe to allow
// raw user input to the console process. Stripping out
// out the control characters.
export class ConsoleFilter extends Transform {
  constructor() {
    super({
      readableObjectMode: true,
      writableObjectMode: true
    })
  }

  _transform(chunk, _encoding, next) {
    const buf = Buffer.from(chunk, 'utf8')
    const bufMatch = Buffer.from('05', 'hex')

    if (buf.includes(bufMatch)) {
      return next()
    }

    return next(null, chunk)
  }
}
