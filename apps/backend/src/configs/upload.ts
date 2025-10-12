import { formatDate } from '@forum-monorepo/utils'
import multer from 'multer'
import crypto from 'crypto'

const hash = crypto.randomBytes(4).toString('hex')

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${formatDate}_${hash}`)
  },
})

export const upload = multer({ storage })
