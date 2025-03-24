import { Server } from "socket.io";

export default (io: Server) => {
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

    socket.on("sendMessage", async (message) => {
      const { sender, receiver } = message;
      const roomId = [sender, receiver].sort().join("_");
      io.to(roomId).emit("receiveMessage", message);
    });

    socket.on("joinDoctorRoom", (doctorId) => {
      socket.join(doctorId);
    });

    socket.on("disconnect", () => {
    });
  });
};
