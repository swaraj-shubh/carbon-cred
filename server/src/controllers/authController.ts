import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";

export const registerUser = async (req: any, res: any) => {
  const { email, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword, role });
    res.status(201).json({ message: "User created", user });
  } catch (err: unknown) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

export const loginUser = async (req: any, res: any) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET as string);
    res.status(200).json({ token, role: user.role });
  } catch (err: unknown) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};
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

export const getUserProfile = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(400).json({ error: "Missing or invalid userId" });
      return;
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
};
