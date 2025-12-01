"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/mint.ts
const express_1 = __importDefault(require("express"));
const mintController_1 = require("../controllers/mintController");
const router = express_1.default.Router();
router.post("/submit", mintController_1.submitMintRecord); // POST /api/mint/submit
router.get("/all", mintController_1.getAllMintRecords); // GET /api/mint/all
exports.default = router;
