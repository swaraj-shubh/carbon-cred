// controllers/mintController.ts
import MintRecord from "../models/MintRecord";

export const submitMintRecord = async (req: any, res: any) => {
  const { mintAmount, mintRecipient } = req.body;

  if (!mintAmount || !mintRecipient) {
    return res.status(400).json({ message: "mintAmount and mintRecipient are required" });
  }

  try {
    const record = await MintRecord.create({
      mintAmount,
      mintRecipient,
    });
    res.status(201).json(record);
  } catch (err: unknown) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

    export const getAllMintRecords = async (_req: any, res: any) => {
  try {
    const records = await MintRecord.find().sort({ createdAt: -1 });
    res.status(200).json(records);
  } catch (err: unknown) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};
