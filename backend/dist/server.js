"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./src/config/db"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const socket_1 = __importDefault(require("./src/socket/socket"));
const errorHandler_1 = __importDefault(require("./src/middleware/errorHandler"));
const adminRoutes_1 = __importDefault(require("./src/routes/adminRoutes"));
const userRoutes_1 = __importDefault(require("./src/routes/userRoutes"));
const doctorRoutes_1 = __importDefault(require("./src/routes/doctorRoutes"));
const appointmentRoutes_1 = __importDefault(require("./src/routes/appointmentRoutes"));
const paymentRoutes_1 = __importDefault(require("./src/routes/paymentRoutes"));
const chatRoutes_1 = __importDefault(require("./src/routes/chatRoutes"));
const slotRoutes_1 = __importDefault(require("./src/routes/slotRoutes"));
const reviewRoutes_1 = __importDefault(require("./src/routes/reviewRoutes"));
const prescription_routes_1 = __importDefault(require("./src/routes/prescription.routes"));
const dashboard_1 = __importDefault(require("./src/routes/dashboard"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
    credentials: true,
    methods: "GET, POST, PUT, DELETE, OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// ✅ Handle Preflight Requests (OPTIONS)
app.options("*", (req, res) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:5173");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.sendStatus(200);
});
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:5173", // ✅ Replace "*" with your frontend URL
        credentials: true, // ✅ Allow credentials
        methods: ["GET", "POST"], // ✅ Specify allowed methods
    },
});
app.use((req, res, next) => {
    req.io = io; // Attach `io` to request
    next();
});
(0, socket_1.default)(io);
// Routes
app.use("/api/admin", adminRoutes_1.default);
app.use("/api/user", userRoutes_1.default);
app.use("/api/doctor", doctorRoutes_1.default);
app.use("/api/appointments", appointmentRoutes_1.default);
app.use("/api/payment", paymentRoutes_1.default);
app.use("/api/chat", chatRoutes_1.default);
app.use("/api/slots", slotRoutes_1.default);
app.use("/api/reviews", reviewRoutes_1.default);
app.use("/api/prescriptions", prescription_routes_1.default);
app.use("/api/dashboard", dashboard_1.default);
app.use(errorHandler_1.default);
// Start the server after DB connection
const PORT = process.env.PORT || 5001;
(0, db_1.default)()
    .then(() => {
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
})
    .catch((error) => {
    console.error("Database connection failed:", error);
    process.exit(1);
});
exports.default = { app, io };
