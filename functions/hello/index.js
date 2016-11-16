const fs    = require('fs')
const AWS   = require('aws-sdk')
const unzip = require('unzip')

const s3 = new AWS.S3({region: 'ap-northeast-1'})

exports.handle = function(e, ctx, cb) {
  const unzipStream = unzip.Extract({ path: '/tmp/' })
  unzipStream.on('close', () => {
    const stats = fs.statSync('/tmp/binary/params.bin')
    console.log(stats)
    cb(null, stats)
    ctx.done(null, 'success')
  })
  s3.getObject({
    Bucket: 'naoys.gikou.binary',
    Key: 'binary_20160606.zip'
  })
    .createReadStream()
    .pipe(unzipStream)
}
