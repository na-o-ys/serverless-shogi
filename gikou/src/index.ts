import { spawn } from 'child_process'
import { setup } from './setup'
import { parse as parseInfo, selectBestPv } from './info'
import split = require('split')

export default async function(event, context, callback) {
  await setup()
  const { byoyomi, position, multipv = 1 } = event.queryStringParameters
  console.log(event)

  const gikou = spawn('./gikou', [], { cwd: '/tmp/' })
  gikou.stdin.write(generateCommand(byoyomi, position, multipv))

  const result = await getResult(gikou.stdout)
  gikou.kill()

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      request: event.queryStringParameters,
      ...result
    })
  }
  callback(null, response)
}

function getResult(stdout: NodeJS.ReadableStream) {
  let infoList = []
  const generateResult = bestmove => ({
    bestmove,
    bestpv: selectBestPv(infoList),
    info_list: infoList
  })
  return new Promise(resolve => {
    stdout.pipe(split()).on('data', data => {
      const line: string = data.toString()
      const [cmd, ...words] = line.split(" ")
      console.log(line)

      if (cmd == "info") infoList.push(parseInfo(words))
      if (cmd == "bestmove") resolve(generateResult(words[0]))
    })
  })
}

function generateCommand(byoyomi, position, multipv) {
  return `usi
setoption name USI_Ponder value false
setoption name USI_Hash value 1024
setoption name MultiPV value ${multipv}
isready
usinewgame
position ${position}
go btime 0 wtime 0 byoyomi ${byoyomi}
`
}