import { formatDate } from '@forum-monorepo/utils'
import multer from 'multer'
import crypto from 'crypto'
import path from 'path'

const storage = multer.diskStorage({
  destination: path.resolve(process.cwd(), 'uploads'),
  filename: (req, file, cb) => {
    const hash = crypto.randomBytes(8).toString('hex')
    const ext = path.extname(file.originalname)
    const filename = `${formatDate(Date())}_${hash}${ext}`
    cb(null, filename)
  },
})

export const upload = multer({ storage })
