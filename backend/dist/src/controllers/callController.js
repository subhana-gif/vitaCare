"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallController = void 0;
const mongoose_1 = require("mongoose");
const HttpStatus_1 = require("../enums/HttpStatus");
class CallController {
    constructor(callService) {
        this.callService = callService;
    }
    getCallHistory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, targetId } = req.params;
                const calls = yield this.callService.getCallHistory(new mongoose_1.Types.ObjectId(userId), new mongoose_1.Types.ObjectId(targetId));
                res.status(HttpStatus_1.HttpStatus.OK).json(calls);
            }
            catch (error) {
                res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({ message: HttpStatus_1.HttpMessage.BAD_REQUEST });
            }
        });
    }
}
exports.CallController = CallController;
