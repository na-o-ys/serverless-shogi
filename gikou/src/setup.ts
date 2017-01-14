import * as fs   from 'fs'
import { S3 }  from 'aws-sdk'

const s3 = new S3({region: 'ap-northeast-1'})
const GikouBinaries = ['gikou', 'book.bin', 'params.bin', 'probability.bin', 'progress.bin']

export async function setup() {
  await Promise.all(GikouBinaries.map(
    file => saveS3Object('naoys.gikou.binary', file, `/tmp/${file}`)
  ))
  await fs.chmod('/tmp/gikou', 0o755)
}

function saveS3Object(bucket, key, dest) {
  if (fs.existsSync(dest)) return Promise.resolve(dest)
  return writeStreamToFile(dest, s3.getObject({
    Bucket: bucket,
    Key: key
  }).createReadStream())
}

function writeStreamToFile(filePath, readStream) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    readStream.pipe(file)
    file.on("finish", () => resolve(filePath))
    file.on("error", reject)
  })
}
