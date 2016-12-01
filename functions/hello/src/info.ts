export function parse(words: string[]) {
  let result = { "pv": [], "raw_string": ["info", ...words].join(" ") }
  let command = null
  words.forEach(word => {
    switch(word) {
      case "score":
        return
      case "lowerbound":
        result["lowerbound"] = true
        return
      case "upperbound":
        result["upperbound"] = true
        return
      case "cp":
        command = "score_cp"
        return
      case "mate":
        command = "score_mate"
        return
    }
    switch(command) {
      case null:
        command = word
        return
      case "pv":
        result["pv"].push(word)
        return
      default:
        result[command] = parseInt(word)
        command = null
    }
  })
  return result
}