import fs       from 'fs'
import AWS      from 'aws-sdk'
import unzip    from 'unzip'
import { spawn } from 'child_process'

const cmd = `usi
setoption name USI_Ponder value false
setoption name USI_Hash value 1024
setoption name MultiPV value 1
isready
usinewgame
position startpos moves 2g2f 8c8d 7g7f 4a3b 6i7h 8d8e 8h7g 3c3d 7i8h 2b7g+ 8h7g 3a4b 3i3h 7a7b 4g4f 6c6d 3g3f 7b6c 5i6h 4b3c 3h4g 7c7d 2i3g 8a7c 2h2i 8b8a 4i4h 6a6b 9g9f 9c9d 1g1f 1c1d 2f2e 5a4b 4g5f 6c5d 6h7i 4b3a 6g6f 6d6e 3f3e 3d3e 3g4e 3c3d 2e2d 2c2d 2i2d 3b2c 2d2i P*2d 7f7e 6e6f P*6c 6b6c 7e7d 7c6e 5f6e 8e8f 8g8f 6f6g+ 7h6g 5d6e B*7b P*7h 7i6i 3d4e 7b8a+ N*5e 6g6h P*6g 6h7h P*7f R*5a 3a2b 8a9a 4e4f
go btime 0 wtime 0 byoyomi 10000
`

export default function(e, ctx, cb) {
  const binary_files = ['gikou', 'book.bin', 'params.bin', 'probability.bin', 'progress.bin']
  const promises = binary_files.map(
    file => saveS3Object('naoys.gikou.binary', file, `/tmp/${file}`)
  )
  Promise.all(promises)
    .then(files => {
      fs.chmodSync('/tmp/gikou', 0o755)
      const gikou = spawn('./gikou', [], { cwd: '/tmp/' })
      gikou.stdin.write(cmd)
      gikou.stdout.on('data', d => {
        console.log(d.toString())
      })
      gikou.stderr.on('data', d => {
        console.log(d.toString())
      })
      setTimeout(() => { ctx.done(null, 'success') }, 15000);
      // const stats = files.map(file => fs.statSync(file))
      // console.log(stats)
      // cb(null, stats)
      // ctx.done(null, 'success')
    }
  )
}

const s3 = new AWS.S3({region: 'ap-northeast-1'})

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
