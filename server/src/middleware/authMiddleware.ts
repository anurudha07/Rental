import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

interface DecodedToken extends JwtPayload {
  sub?: string;
  role?: string;
  "custom:role"?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

/**
 * Auth middleware factory
 * allowedRoles: string[] (e.g. ["manager"], ["tenant"])
 */
export const authMiddleware = (allowedRoles: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined;

    if (!token) {
      res.status(401).json({ message: "Unauthorized: missing token" });
      return;
    }

    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        console.error("JWT_SECRET not set");
        res.status(500).json({ message: "Server auth misconfiguration" });
        return;
      }

      const decoded = jwt.verify(token, secret) as DecodedToken;
      const userId = decoded.sub || (decoded as any).id || "";
      const roleFromToken = (decoded.role as string) || (decoded["custom:role"] as string) || "";

      const normalizedRole = (roleFromToken || "").toLowerCase();

      req.user = {
        id: String(userId),
        role: normalizedRole,
      };

      if (allowedRoles.length > 0) {
        const allowedLower = allowedRoles.map((r) => r.toLowerCase());
        if (!allowedLower.includes(normalizedRole)) {
          res.status(403).json({ message: "Access Denied" });
          return;
        }
      }
    } catch (err) {
      console.error("Failed to verify token:", err);
      res.status(401).json({ message: "Invalid or expired token" });
      return;
    }

    next();
  };
};
