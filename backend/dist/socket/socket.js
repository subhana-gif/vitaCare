"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (io) => {
    // Store active users (socketId -> userId) for easier lookup
    const users = {};
    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);
        // --- Existing Chat Logic ---
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
        socket.on("sendMessage", async (message) => {
            const { sender, receiver } = message;
            const roomId = [sender, receiver].sort().join("_");
            io.to(roomId).emit("receiveMessage", message);
        });
        socket.on("joinDoctorRoom", (doctorId) => {
            socket.join(doctorId);
        });
        socket.on("messageDeleted", async ({ messageId, userId, doctorId }) => {
            const roomId = [userId, doctorId].sort().join("_");
            io.to(roomId).emit("messageDeleted", { messageId });
        });
        // --- New Video Call Logic ---
        // Register user for video calls
        socket.on("registerVideoCall", (userId) => {
            users[socket.id] = userId;
            io.emit("userList", Object.values(users)); // Optional: Notify all clients of active users
        });
        // Handle call initiation (ringing)
        socket.on("callUser", ({ to, from, offer }) => {
            const targetSocketId = Object.keys(users).find((key) => users[key] === to // Fixed syntax here
            );
            if (targetSocketId) {
                io.to(targetSocketId).emit("incomingCall", {
                    from,
                    offer,
                    socketId: socket.id,
                });
            }
            else {
                socket.emit("callFailed", { message: "User not available" });
            }
        });
        // Handle call acceptance
        socket.on("acceptCall", ({ to, answer }) => {
            io.to(to).emit("callAccepted", { answer });
        });
        // Handle ICE candidates
        socket.on("iceCandidate", ({ to, candidate }) => {
            io.to(to).emit("iceCandidate", { candidate });
        });
        // Handle call rejection (optional)
        socket.on("rejectCall", ({ to }) => {
            io.to(to).emit("callRejected");
        });
        // Handle call end
        socket.on("endCall", ({ to }) => {
            io.to(to).emit("callEnded");
        });
        // --- Cleanup on Disconnect ---
        socket.on("disconnect", () => {
            const userId = users[socket.id];
            delete users[socket.id];
            io.emit("userList", Object.values(users)); // Optional: Update user list
            console.log("User disconnected:", socket.id);
            // Notify the other party if a call was active (optional)
            if (userId) {
                const otherSocketId = Object.keys(users).find((key) => users[key] !== userId);
                if (otherSocketId) {
                    io.to(otherSocketId).emit("callEnded");
                }
            }
        });
    });
};
