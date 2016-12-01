import * as AWS  from 'aws-sdk'
import { spawn } from 'child_process'
import { setup } from './setup'
import { parse as parseInfo } from './info'
import split = require('split')

export default async function(request, ctx, cb) {
  await setup()
  const { byoyomi, position } = request
  setTimeout(() => { ctx.done('timeout') }, byoyomi + 5000)

  const gikou = spawn('./gikou', [], { cwd: '/tmp/' })
  gikou.stdin.write(generateCommand(byoyomi, position))

  const result = await getResult(gikou.stdout)
  return ctx.done(null, result)
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

function selectBestPv(infoList: any[]) {
  return infoList.reduce((bestinfo, info) => {
    const depth         = bestinfo["depth"] || 0
    const seldepth      = bestinfo["seldepth"] || 0
    const curr_depth    = info["depth"] || 0
    const curr_seldepth = info["seldepth"] || 0
    if (depth < curr_depth || (depth == curr_depth && seldepth < curr_seldepth)) {
      return info
    }
    return bestinfo
  })
}

function generateCommand(byoyomi, position) {
  return `usi
setoption name USI_Ponder value false
setoption name USI_Hash value 1024
setoption name MultiPV value 1
isready
usinewgame
position ${position}
go btime 0 wtime 0 byoyomi ${byoyomi}
`
}