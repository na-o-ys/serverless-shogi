"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var child_process_1 = require("child_process");
var setup_1 = require("./setup");
var info_1 = require("./info");
var split = require("split");
function default_1(request, ctx, cb) {
    return __awaiter(this, void 0, void 0, function () {
        var byoyomi, position, gikou, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, setup_1.setup()];
                case 1:
                    _a.sent();
                    byoyomi = request.byoyomi, position = request.position;
                    gikou = child_process_1.spawn('./gikou', [], { cwd: '/tmp/' });
                    gikou.stdin.write(generateCommand(byoyomi, position));
                    setTimeout(function () { ctx.done('timeout'); }, byoyomi + 5000);
                    return [4 /*yield*/, getResult(gikou.stdout)];
                case 2:
                    result = _a.sent();
                    return [2 /*return*/, ctx.done(null, result)];
            }
        });
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
function getResult(stdout) {
    return __awaiter(this, void 0, void 0, function () {
        var infoList;
        return __generator(this, function (_a) {
            infoList = [];
            stdout.pipe(split()).on('data', function (data) {
                var line = data.toString();
                console.log(line);
                var _a = line.split(" "), cmd = _a[0], words = _a.slice(1);
                if (cmd == "info") {
                    infoList.push(info_1.parse(words));
                }
                if (cmd == "bestmove") {
                    var bestmove = words[0];
                    var bestpv = infoList.reduce(function (bestinfo, info) {
                        var depth = bestinfo["depth"] || 0;
                        var seldepth = bestinfo["seldepth"] || 0;
                        var curr_depth = info["depth"] || 0;
                        var curr_seldepth = info["seldepth"] || 0;
                        if (depth < curr_depth || (depth == curr_depth && seldepth < curr_seldepth)) {
                            return info;
                        }
                        return bestinfo;
                    });
                    ctx.done(null, { request: request, bestmove: bestmove, bestpv: bestpv, info_list: infoList });
                }
            });
            return [2 /*return*/];
        });
    });
}
function generateCommand(byoyomi, position) {
    return "usi\nsetoption name USI_Ponder value false\nsetoption name USI_Hash value 1024\nsetoption name MultiPV value 1\nisready\nusinewgame\nposition " + position + "\ngo btime 0 wtime 0 byoyomi " + byoyomi + "\n";
}
