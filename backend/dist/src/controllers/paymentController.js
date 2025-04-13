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
const HttpStatus_1 = require("../enums/HttpStatus");
class PaymentController {
    constructor(paymentService) {
        this.paymentService = paymentService;
    }
    createOrder(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { amount } = req.body;
                const order = yield this.paymentService.createOrder(amount);
                res.status(HttpStatus_1.HttpStatus.OK).json(order);
            }
            catch (error) {
                res.status(HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: HttpStatus_1.HttpMessage.INTERNAL_SERVER_ERROR });
            }
        });
    }
    verifyPayment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { order_id, payment_id, signature, appointmentId } = req.body;
                if (!order_id || !payment_id || !signature || !appointmentId) {
                    return res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({ message: HttpStatus_1.HttpMessage.BAD_REQUEST });
                }
                const verificationData = { order_id, payment_id, signature, appointmentId };
                const isValid = yield this.paymentService.verifyPayment(verificationData);
                if (!isValid) {
                    return res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({ message: HttpStatus_1.HttpMessage.BAD_REQUEST });
                }
                return res.status(HttpStatus_1.HttpStatus.OK).json({ success: true, message: HttpStatus_1.HttpMessage.OK });
            }
            catch (error) {
                console.error("Payment Verification Error:", error);
                return res.status(HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: HttpStatus_1.HttpMessage.INTERNAL_SERVER_ERROR });
            }
        });
    }
    processRefund(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { appointmentId } = req.body;
                if (!appointmentId) {
                    return res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({ message: HttpStatus_1.HttpMessage.BAD_REQUEST });
                }
                const appointment = yield this.paymentService.getAppointmentById(appointmentId);
                if (!appointment) {
                    return res.status(HttpStatus_1.HttpStatus.NOT_FOUND).json({ message: HttpStatus_1.HttpMessage.NOT_FOUND });
                }
                const paymentId = appointment.paymentId;
                if (!paymentId) {
                    return res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({ message: HttpStatus_1.HttpMessage.BAD_REQUEST });
                }
                const refundDetails = yield this.paymentService.processRefund(appointmentId, paymentId);
                if (refundDetails) {
                    return res.status(HttpStatus_1.HttpStatus.OK).json({
                        success: true,
                        message: HttpStatus_1.HttpMessage.OK,
                        refundDetails
                    });
                }
                return res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: HttpStatus_1.HttpMessage.BAD_REQUEST
                });
            }
            catch (error) {
                console.error("Refund Error:", error);
                return res.status(HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: HttpStatus_1.HttpMessage.INTERNAL_SERVER_ERROR
                });
            }
        });
    }
}
exports.default = PaymentController;
