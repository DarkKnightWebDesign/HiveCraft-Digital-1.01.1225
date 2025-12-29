import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { db } from "../db";
import { users, type User } from "@shared/schema";
import { eq } from "drizzle-orm";

const SALT_ROUNDS = 10;

export interface AuthRequest extends Request {
  user?: User;
}

// Register new user
export async function register(req: Request, res: Response) {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ 
        message: "Email, password, and name are required" 
      });
    }

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (existingUser) {
      return res.status(409).json({ 
        message: "User with this email already exists" 
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const [newUser] = await db.insert(users).values({
      email: email.toLowerCase(),
      passwordHash,
      name,
      role: "client", // Default role
    }).returning();

    // Set session
    if (req.session) {
      req.session.userId = newUser.id;
    }

    // Return user without password hash
    const { passwordHash: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ 
      user: userWithoutPassword,
      message: "Registration successful" 
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Failed to register user" });
  }
}

// Login user
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        message: "Email and password are required" 
      });
    }

    // Find user
    const user = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (!user || !user.passwordHash) {
      return res.status(401).json({ 
        message: "Invalid email or password" 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({ 
        message: "Invalid email or password" 
      });
    }

    // Set session
    if (req.session) {
      req.session.userId = user.id;
    }

    // Return user without password hash
    const { passwordHash: _, ...userWithoutPassword } = user;
    res.json({ 
      user: userWithoutPassword,
      message: "Login successful" 
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Failed to login" });
  }
}

// Logout user
export async function logout(req: Request, res: Response) {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logout successful" });
    });
  } else {
    res.json({ message: "No active session" });
  }
}

// Get current user
export async function getCurrentUser(req: AuthRequest, res: Response) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, req.session.userId),
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: "Failed to get user" });
  }
}

// Middleware to require authentication
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

// Middleware to require specific role
export function requireRole(...roles: string[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, req.session.userId),
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!roles.includes(user.role)) {
        return res.status(403).json({ 
          message: "Insufficient permissions" 
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("Role check error:", error);
      res.status(500).json({ message: "Authorization failed" });
    }
  };
}
