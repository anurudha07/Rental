// server/controllers/authControllers.ts
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { SignOptions, Secret } from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const JWT_SECRET: Secret = (process.env.JWT_SECRET ?? "secret") as Secret;
const EXPIRES_IN: SignOptions["expiresIn"] = (process.env.EXPIRES_IN ?? "2d") as SignOptions["expiresIn"];

const generateToken = (payload: { id: string; role: string }): string => {
  const options: SignOptions = { expiresIn: EXPIRES_IN };

  return jwt.sign({ sub: payload.id, role: payload.role, "custom:role": payload.role }, JWT_SECRET, options);
};

const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/**
 * POST /api/auth/signup
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    let { username, email, password, role } = req.body as {
      username: string;
      email: string;
      password: string;
      role: string;
    };

    if (!username || !email || !password || !role) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    role = role.toLowerCase();
    if (!["tenant", "manager"].includes(role)) {
      res.status(400).json({ message: "Role must be 'tenant' or 'manager'" });
      return;
    }

    if (!isValidEmail(email)) {
      res.status(400).json({ message: "Invalid email format" });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: "Password must be at least 6 characters" });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: "Email already in use" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const created = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          role,
        },
      });

      const cognitoId = user.id.toString();

      if (role === "tenant") {
        await tx.tenant.create({
          data: {
            cognitoId,
            name: username,
            email,
            phoneNumber: "",
          },
        });
      } else {
        await tx.manager.create({
          data: {
            cognitoId,
            name: username,
            email,
            phoneNumber: "",
          },
        });
      }

      return user;
    });

    const token = generateToken({ id: created.id.toString(), role: created.role });

    res.status(201).json({
      token,
      user: {
        id: created.id.toString(),
        username: created.username,
        email: created.email,
        role: created.role,
      },
    });
  } catch (err: any) {
    console.error("register error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    if (!email || !password) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const token = generateToken({ id: user.id.toString(), role: user.role });

    res.status(200).json({
      token,
      user: {
        id: user.id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err: any) {
    console.error("login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/auth/me
 * Protected endpoint - uses authMiddleware
 *
 * returns { authUser: { cognitoInfo: { userId }, userInfo, userRole } }
 */
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userIdString = req.user?.id;
    const role = req.user?.role || "";

    if (!userIdString) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // default userInfo from User table (fallback)
    let userInfo = {
      name: "",
      email: "",
      phoneNumber: "",
    };

    // try to locate tenant or manager by cognitoId
    if (role === "tenant") {
      const tenant = await prisma.tenant.findUnique({
        where: { cognitoId: userIdString },
      });
      if (tenant) {
        userInfo = {
          name: tenant.name,
          email: tenant.email,
          phoneNumber: tenant.phoneNumber,
        };
      } else {
        // fallback to user table
        const user = await prisma.user.findUnique({ where: { id: Number(userIdString) } });
        if (user) userInfo = { name: user.username, email: user.email, phoneNumber: "" };
      }
    } else if (role === "manager") {
      const manager = await prisma.manager.findUnique({
        where: { cognitoId: userIdString },
      });
      if (manager) {
        userInfo = {
          name: manager.name,
          email: manager.email,
          phoneNumber: manager.phoneNumber,
        };
      } else {
        const user = await prisma.user.findUnique({ where: { id: Number(userIdString) } });
        if (user) userInfo = { name: user.username, email: user.email, phoneNumber: "" };
      }
    } else {
      const user = await prisma.user.findUnique({ where: { id: Number(userIdString) } });
      if (user) userInfo = { name: user.username, email: user.email, phoneNumber: "" };
    }

    const authUser = {
      cognitoInfo: { userId: String(userIdString) },
      userInfo,
      userRole: role,
    };

    res.status(200).json({ authUser });
  } catch (err: any) {
    console.error("getCurrentUser error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
