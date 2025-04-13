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
const chatdpservices_1 = require("../services/chatdpservices");
const chatdpRepository_1 = require("../repositories/chatdpRepository");
exports.default = (io) => {
    const chatdpService = new chatdpservices_1.ChatdpService(new chatdpRepository_1.ChatdpRepository());
    const users = {};
    io.on("connection", (socket) => {
        socket.on("joinRoom", ({ userId, doctorId }) => {
            const roomId = [userId, doctorId].sort().join("_");
            socket.join(roomId);
        });
        socket.on("joinAdminRoom", () => {
            socket.join("adminRoom");
        });
        socket.on("joinUserRoom", (userId) => {
            socket.join(userId);
        });
        socket.on("sendMessage", (message) => __awaiter(void 0, void 0, void 0, function* () {
            const { sender, receiver } = message;
            const roomId = [sender, receiver].sort().join("_");
            io.to(roomId).emit("receiveMessage", message);
        }));
        socket.on("joinDoctorRoom", (doctorId) => {
            socket.join(doctorId);
        });
        socket.on("messageDeleted", (_a) => __awaiter(void 0, [_a], void 0, function* ({ messageId, userId, doctorId }) {
            if (!userId || !doctorId) {
                console.error("Invalid userId or doctorId for messageDeleted event");
                return;
            }
            const roomId = [userId, doctorId].sort().join("_");
            io.to(roomId).emit("messageDeleted", { messageId });
        }));
        socket.on("registerVideoCall", (userId) => {
            users[socket.id] = userId;
            io.emit("userList", Object.values(users));
        });
        socket.on("callUser", ({ to, from, offer }) => {
            const targetSocketId = Object.keys(users).find((key) => users[key] === to);
            if (targetSocketId) {
                io.to(targetSocketId).emit("incomingCall", { from, offer, socketId: socket.id });
                socket.emit("callTargetSocket", { targetSocketId });
            }
            else {
                socket.emit("callFailed", { message: "User not available" });
            }
        });
        socket.on("iceCandidate", ({ to, candidate }) => {
            io.to(to).emit("iceCandidate", { candidate });
        });
        socket.on("acceptCall", ({ to, answer }) => {
            io.to(to).emit("callAccepted", { answer });
        });
        socket.on("rejectCall", ({ to }) => {
            io.to(to).emit("callRejected");
        });
        // Updated: Include duration in endCall event
        socket.on("endCall", ({ to, duration }) => {
            io.to(to).emit("callEnded", { duration: duration || 0 });
        });
        socket.on("callHistory", (callData) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const { sender, receiver, type, status, callDuration, createdAt } = callData;
                const message = yield chatdpService.sendMessage(sender, receiver, undefined, undefined, { type, status, callDuration, createdAt: new Date(createdAt) });
                const roomId = [sender, receiver].sort().join("_");
                io.to(roomId).emit("receiveMessage", message);
            }
            catch (error) {
                console.error("Error saving call history:", error);
            }
        }));
        socket.on("disconnect", () => {
            const userId = users[socket.id];
            delete users[socket.id];
            io.emit("userList", Object.values(users));
            if (userId) {
                const otherSocketId = Object.keys(users).find((key) => users[key] !== userId);
                if (otherSocketId) {
                    io.to(otherSocketId).emit("callEnded", { duration: 0 });
                }
            }
        });
    });
};
