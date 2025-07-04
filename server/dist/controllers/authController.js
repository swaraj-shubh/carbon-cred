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
exports.getUserProfile = exports.loginUser = exports.registerUser = void 0;
const User_1 = __importDefault(require("../models/User"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, role } = req.body;
    try {
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const user = yield User_1.default.create({ email, password: hashedPassword, role });
        res.status(201).json({ message: "User created", user });
    }
    catch (err) {
        const error = err;
        res.status(400).json({ error: error.message });
    }
});
exports.registerUser = registerUser;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield User_1.default.findOne({ email });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch)
            return res.status(401).json({ error: "Invalid credentials" });
        const token = jsonwebtoken_1.default.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET);
        res.status(200).json({ token, role: user.role });
    }
    catch (err) {
        const error = err;
        res.status(400).json({ error: error.message });
    }
});
exports.loginUser = loginUser;
// export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
//   const { userId } = req.query; // we expect the ID to come from a query param like ?userId=xyz
//   if (!userId || typeof userId !== "string") {
//     res.status(400).json({ error: "Missing or invalid userId" });
//     return;
//   }
//   try {
//     const user = await User.findById(userId).select("-password");
//     if (!user) {
//       res.status(404).json({ error: "User not found" });
//       return;
//     }
//     res.status(200).json(user);
//   } catch (err: unknown) {
//     const error = err as Error;
//     res.status(500).json({ error: error.message });
//   }
// };
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            res.status(400).json({ error: "Missing or invalid userId" });
            return;
        }
        const user = yield User_1.default.findById(userId).select("-password");
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        res.status(200).json(user);
    }
    catch (err) {
        const error = err;
        res.status(500).json({ error: error.message });
    }
});
exports.getUserProfile = getUserProfile;
