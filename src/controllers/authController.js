import { User } from '../models/user.js';
import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import { createSession, setSessionCookies } from '../services/auth.js';
import { Session } from '../models/session.js';
import { sendEmail } from '../utils/sendMail.js';
import jwt from 'jsonwebtoken';
import path from 'node:path';
import fs from 'node:fs/promises';
import handlebars from 'handlebars';
import { sendEmail } from '../../utils/sendMail.js';

export const registerUser = async (req, res) => {
  const exitUser = await User.findOne({
    email: req.body.email,
  });

  if (exitUser) {
    throw createHttpError(400, 'Email is already in use');
  }

  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  const user = await User.create({
    email: req.body.email,
    password: hashedPassword,
  });

  const newSession = await createSession(user._id);
  setSessionCookies(res, newSession);

  res.status(201).json(user);
};

export const loginUser = async (req, res) => {
  const user = await User.findOne({
    email: req.body.email,
  });

  if (!user) {
    throw createHttpError(401, 'Invalid credentials');
  }

  const isValidPassword = await bcrypt.compare(req.body.password, user.password);

  if (!isValidPassword) {
    throw createHttpError(401, 'Invalid credentials');
  }

  await Session.deleteOne({
    userId: user._id,
  });

  const newSession = await createSession(user._id);
  setSessionCookies(res, newSession);

  res.status(200).json(user);
};

export const logoutUser = async (req, res) => {
  if (req.cookies.sessionId) {
    await Session.deleteOne({ _id: req.cookies.sessionId });
  }

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.clearCookie('sessionId');

  res.status(204).send();
};

export const refreshUserSession = async (req, res) => {
  const { sessionId, refreshToken } = req.cookies;

  if (!sessionId || !refreshToken) {
    throw createHttpError(401, 'Missing tokens');
  }

  const session = await Session.findOne({
    _id: sessionId,
    refreshToken,
  });

  if (!session) {
    throw createHttpError(401, 'No session');
  }

  const isRefreshTokenExpired = session.refreshTokenValidUntil < new Date();

  if (isRefreshTokenExpired) {
    await session.deleteOne();

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.clearCookie('sessionId');

    throw createHttpError(401, 'Session expired');
  }

  await session.deleteOne();

  const newSession = await createSession(session.userId);
  setSessionCookies(res, newSession);

  res.status(200).json({
    message: 'Refresh success!',
  });
};

export const requestResetEmail = async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(200).json({
      message: 'If this email exists, a reset link has been sent',
    });
  }

  const resetToken = jwt.sign({ sub: user._id, email }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });

  const templatePath = path.resolve('src/templates/reset-password-email.html');

  const templateSource = await fs.readFile(templatePath, 'utf-8');

  const template = handlebars.compile(templateSource);
  const html = template({
    name: user.username,
    link: `${process.env.FRONTEND_DOMAIN}/reset-password?token=${resetToken}`,
  });

  try {
    await sendEmail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Reset your password',
      html,
    });
  } catch {
    throw createHttpError(500, 'Failed to send the email, please try again later.');
  }

  res.status(200).json({
    message: 'If this email exists, a reset link has been sent',
  });
};

export const requestResetPassword = async (req, res) => {
  const { password, resetToken } = req.body;

  let payload;
  try {
    payload = jwt.verify(resetToken, process.env.JWT_SECRET);
  } catch (error) {
    createHttpError(401, 'Invalid token');
  }

  const user = await User.findOne({ _id: payload.sub, email: payload.email });

  if (!user) {
    createHttpError(404, 'No user');
  }

  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  await User.updateOne(
    { _id: user._id },
    {
      password: hashedPassword,
    }
  );

  await Session.deleteMany({ userId: user._id });

  res.status(200).json({ message: 'Password reset success!!!' });
};
