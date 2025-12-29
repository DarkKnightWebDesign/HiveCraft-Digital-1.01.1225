import { Router } from "express";
import {
  register,
  login,
  logout,
  getCurrentUser,
  requireAuth,
} from "./email-auth";
import passport from "./oauth-config";
import { sendVerificationCode, verifyCode, isSmsConfigured } from "./sms-service";

const router = Router();

// Email/Password Auth routes
router.post("/auth/register", register);
router.post("/auth/login", login);
router.post("/auth/logout", logout);
router.get("/auth/user", getCurrentUser);

// Google OAuth routes
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // Successful authentication, redirect based on role
    const user = req.user as any;
    if (user?.role === "admin") {
      res.redirect("/admin");
    } else {
      res.redirect("/portal");
    }
  }
);

// Facebook OAuth routes
router.get(
  "/auth/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

router.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  (req, res) => {
    // Successful authentication, redirect based on role
    const user = req.user as any;
    if (user?.role === "admin") {
      res.redirect("/admin");
    } else {
      res.redirect("/portal");
    }
  }
);

// GitHub OAuth routes
router.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  (req, res) => {
    // Successful authentication, redirect based on role
    const user = req.user as any;
    if (user?.role === "admin") {
      res.redirect("/admin");
    } else {
      res.redirect("/portal");
    }
  }
);

// SMS Verification routes
router.post("/auth/sms/send", requireAuth, async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const userId = (req.user as any)?.id;

    if (!phoneNumber) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const result = await sendVerificationCode(phoneNumber, userId);
    
    if (result.success) {
      res.json({ message: result.message });
    } else {
      res.status(400).json({ error: result.message });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to send verification code" });
  }
});

router.post("/auth/sms/verify", requireAuth, async (req, res) => {
  try {
    const { code } = req.body;
    const userId = (req.user as any)?.id;

    if (!code) {
      return res.status(400).json({ error: "Verification code is required" });
    }

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const result = await verifyCode(userId, code);
    
    if (result.success) {
      res.json({ message: result.message });
    } else {
      res.status(400).json({ error: result.message });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to verify code" });
  }
});

// Check if SMS is configured
router.get("/auth/sms/status", (req, res) => {
  res.json({ configured: isSmsConfigured() });
});

export default router;
