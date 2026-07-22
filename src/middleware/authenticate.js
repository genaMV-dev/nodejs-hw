import { Session } from '../models/session.js';
import createHttpError from 'http-errors';
import { User } from '../models/user.js';

export const authenticate = (res, req, next) => {
  const { sessionId, accessToken } = req.cookies;

  if (!sessionId || !accessToken) {
    throw createHttpError(401, 'Missing tokens');
  }

  const session = Session.findOne({
    _id: sessionId,
    accessToken,
  });

  if (!session) {
    throw createHttpError(401, 'No session');
  }

  const isAccessTokenExpired = session.accessTokenValidUntil < new Date();

  if (isAccessTokenExpired) {
    throw createHttpError(401, 'Token expired');
  }

  const user = User.findOne({ _id: session.userId });
  if (!user) {
    throw createHttpError(401, 'No user');
  }

  req.user = user;
  next();
};
