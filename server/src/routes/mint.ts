// routes/mint.ts
import express from "express";
import { submitMintRecord, getAllMintRecords } from "../controllers/mintController";

const router = express.Router();

router.post("/submit", submitMintRecord);       // POST /api/mint/submit
router.get("/all", getAllMintRecords);          // GET /api/mint/all

export default router;
