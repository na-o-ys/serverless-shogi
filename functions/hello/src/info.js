"use strict";
function parse(words) {
    var result = { "pv": [], "raw_string": ["info"].concat(words).join(" ") };
    var command = null;
    words.forEach(function (word) {
        switch (word) {
            case "score":
                return;
            case "lowerbound":
                result["lowerbound"] = true;
                return;
            case "upperbound":
                result["upperbound"] = true;
                return;
            case "cp":
                command = "score_cp";
                return;
            case "mate":
                command = "score_mate";
                return;
        }
        switch (command) {
            case null:
                command = word;
                return;
            case "pv":
                result["pv"].push(word);
                return;
            default:
                result[command] = parseInt(word);
                command = null;
        }
    });
    return result;
}
exports.parse = parse;
