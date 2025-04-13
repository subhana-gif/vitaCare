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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const speciality_1 = __importDefault(require("../models/speciality"));
const HttpStatus_1 = require("../enums/HttpStatus");
class SpecialityController {
    specialityStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name } = req.query;
                if (!name) {
                    res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({ error: "Speciality name is required" });
                    return;
                }
                const speciality = yield speciality_1.default.findOne({ name });
                if (!speciality) {
                    res.json({ isActive: false });
                    return;
                }
                res.json({ isActive: speciality.isActive });
            }
            catch (error) {
                console.error("Error checking speciality status:", error);
                res.status(HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ error: HttpStatus_1.HttpMessage.INTERNAL_SERVER_ERROR });
            }
        });
    }
    ;
    addSpeciality(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name } = req.body;
            if (!name) {
                res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({ message: HttpStatus_1.HttpMessage.BAD_REQUEST });
                return;
            }
            try {
                const existingSpeciality = yield speciality_1.default.findOne({ name });
                if (existingSpeciality) {
                    res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({ message: HttpStatus_1.HttpMessage.BAD_REQUEST });
                    return;
                }
                const speciality = new speciality_1.default({ name });
                yield speciality.save();
                res.status(HttpStatus_1.HttpStatus.CREATED).json({ message: HttpStatus_1.HttpMessage.CREATED });
            }
            catch (error) {
                console.error(error);
                res.status(HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: HttpStatus_1.HttpMessage.INTERNAL_SERVER_ERROR });
            }
        });
    }
    getAllSpecialities(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const specialities = yield speciality_1.default.find();
                res.status(HttpStatus_1.HttpStatus.OK).json(specialities);
            }
            catch (error) {
                console.log("error getting speciality:", error);
                res.status(HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: HttpStatus_1.HttpMessage.INTERNAL_SERVER_ERROR });
            }
        });
    }
    toggleSpecialityStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                const speciality = yield speciality_1.default.findById(id);
                if (!speciality) {
                    res.status(HttpStatus_1.HttpStatus.NOT_FOUND).json({ message: HttpStatus_1.HttpMessage.NOT_FOUND });
                    return;
                }
                speciality.isActive = !speciality.isActive;
                yield speciality.save();
                res.status(HttpStatus_1.HttpStatus.OK).json(speciality);
            }
            catch (error) {
                console.log("error toggling speciality:", error);
                res.status(HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: HttpStatus_1.HttpMessage.INTERNAL_SERVER_ERROR });
            }
        });
    }
}
exports.default = new SpecialityController();
