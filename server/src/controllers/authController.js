import jwt from "jsonwebtoken";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function toPublicUser(user) {
  return { id: user._id, name: user.name, email: user.email };
}

function generateVerificationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Name, email and password are all required." });
  }
  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters." });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res
      .status(409)
      .json({ message: "An account with that email already exists." });
  }

  const user = await User.create({ name, email, password });
  const token = signToken(user._id);

  res.status(201).json({ token, user: toPublicUser(user) });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  // .select('+password') because the schema hides password by default.
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password",
  );
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Incorrect email or password." });
  }

  const token = signToken(user._id);
  res.json({ token, user: toPublicUser(user) });
});

// GET /api/auth/me  (requires auth)
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found." });
  res.json({ user: toPublicUser(user) });
});

// POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res
      .status(404)
      .json({ message: "No account exists with that email." });
  }

  const code = generateVerificationCode();
  user.resetCode = code;
  user.resetCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  res.json({
    message: "Verification code sent. Use it to reset your password.",
    code,
  });
});

// POST /api/auth/reset-password
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, code, password } = req.body;

  if (!email || !code || !password) {
    return res
      .status(400)
      .json({
        message: "Email, verification code and a new password are required.",
      });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters." });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+resetCode +resetCodeExpiresAt",
  );
  if (!user) {
    return res
      .status(404)
      .json({ message: "No account exists with that email." });
  }

  const isExpired =
    !user.resetCodeExpiresAt ||
    new Date(user.resetCodeExpiresAt).getTime() < Date.now();
  if (isExpired || user.resetCode !== String(code)) {
    return res
      .status(400)
      .json({ message: "The verification code is invalid or expired." });
  }

  user.password = password;
  user.resetCode = null;
  user.resetCodeExpiresAt = null;
  await user.save();

  res.json({ message: "Password updated successfully." });
});
