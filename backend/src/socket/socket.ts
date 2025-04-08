import { Server, Socket } from "socket.io";
import  {ChatdpService}  from "../services/chatdpservices";
import  {ChatdpRepository}  from "../repositories/chatdpRepository";

export default (io: Server) => {
  const chatdpService = new ChatdpService(new ChatdpRepository()); // pass an instance
  const users: { [key: string]: string } = {};

  io.on("connection", (socket: Socket) => {

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
      if (!userId || !doctorId) {
        console.error("Invalid userId or doctorId for messageDeleted event");
        return;
      }
      const roomId = [userId, doctorId].sort().join("_");
      io.to(roomId).emit("messageDeleted", { messageId });
    });

    
    socket.on("registerVideoCall", (userId: string) => {
      users[socket.id] = userId;
      io.emit("userList", Object.values(users)); // Optional: Notify all clients of active users
    });

    socket.on("callUser", ({ to, from, offer }) => {
      const targetSocketId = Object.keys(users).find((key) => users[key] === to);
      if (targetSocketId) {
        io.to(targetSocketId).emit("incomingCall", { from, offer, socketId: socket.id });
        socket.emit("callTargetSocket", { targetSocketId });
      } else {
        socket.emit("callFailed", { message: "User not available" });
      }
    });
    
    socket.on("iceCandidate", ({ to, candidate }) => {
      io.to(to).emit("iceCandidate", { candidate });
    });
    
    socket.on("acceptCall", ({ to, answer }) => {
      io.to(to).emit("callAccepted", { answer });
    });
    
    // Handle call rejection (optional)
    socket.on("rejectCall", ({ to }) => {
      io.to(to).emit("callRejected");
    });

    // Handle call end
    socket.on("endCall", ({ to }) => {
      io.to(to).emit("callEnded");
    });

    socket.on("callHistory", async (callData) => {
      try {
        const { sender, receiver, type, status, callDuration, createdAt } = callData;
        console.log("Received callHistory:", callData);

        // Save call history as a message
        const message = await chatdpService.sendMessage(
          sender,
          receiver,
          undefined, // No text
          undefined, // No media
          {
            type,
            status,
            callDuration,
            createdAt: new Date(createdAt),
          } as any // Type assertion to bypass strict typing for now
        );

        const roomId = [sender, receiver].sort().join("_");
        io.to(roomId).emit("receiveMessage", message); // Notify both users
        console.log("Call history saved and emitted:", message);
      } catch (error) {
        console.error("Error saving call history:", error);
      }
    });

    // --- Cleanup on Disconnect ---
    socket.on("disconnect", () => {
      const userId = users[socket.id];
      delete users[socket.id];
      io.emit("userList", Object.values(users)); 
      if (userId) {
        const otherSocketId = Object.keys(users).find(
          (key) => users[key] !== userId
        );
        if (otherSocketId) {
          io.to(otherSocketId).emit("callEnded");
        }
      }
    });
  });
};