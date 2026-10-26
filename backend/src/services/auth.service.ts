import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.js';
import { ITokenPair, IUserPayload } from '../types/index.js';
import axios from 'axios';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client();

export class AuthService {
  private static generateTokens(user: IUser): ITokenPair {
    const payload: IUserPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const accessSecret = process.env.JWT_SECRET || 'quillforge_secret_jwt_key_2026';
    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'quillforge_secret_refresh_jwt_key_2026';

    const accessToken = jwt.sign(payload, accessSecret, {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    } as any);

    const refreshToken = jwt.sign(payload, refreshSecret, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    } as any);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
    };
  }

  static async register(data: {
    name: string;
    email: string;
    password?: string;
    role?: 'ADMIN' | 'USER';
  }) {
    const existing = await User.findOne({ email: data.email.toLowerCase(), isDeleted: false });
    if (existing) {
      throw new Error('A user with this email address already exists');
    }

    const user = await User.create({
      name: data.name,
      email: data.email.toLowerCase(),
      password: data.password,
      role: data.role || 'USER',
    });

    const tokens = this.generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return {
      user: user.toJSON(),
      tokens,
    };
  }

  static async login(data: { email: string; password?: string }) {
    const user = await User.findOne({
      email: data.email.toLowerCase(),
      isDeleted: false,
    })
      .select('+password +refreshToken')
      .populate('roleId');

    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (user.blocked) {
      throw new Error(`Your account has been suspended: ${user.blockReason || 'Contact support'}`);
    }

    if (data.password) {
      const isMatch = await user.comparePassword(data.password);
      if (!isMatch) {
        throw new Error('Invalid email or password');
      }
    }

    const tokens = this.generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return {
      user: user.toJSON(),
      tokens,
    };
  }

  static async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new Error('Refresh token is required');
    }

    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'quillforge_secret_refresh_jwt_key_2026';
    let decoded: IUserPayload;

    try {
      decoded = jwt.verify(refreshToken, refreshSecret) as IUserPayload;
    } catch {
      throw new Error('Invalid or expired refresh token');
    }

    const user = await User.findOne({
      _id: decoded.id,
      isDeleted: false,
    }).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken) {
      throw new Error('Invalid or revoked refresh token');
    }

    const tokens = this.generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return tokens;
  }

  static async socialGoogle(accessToken: string) {
    if (!accessToken) throw new Error('Google access token is required');

    let email = '';
    let name = '';
    let sub = '';
    let picture = '';

    try {
      // Fetch user profile from Google userinfo API
      const res = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      email = res.data.email;
      name = res.data.name || res.data.given_name || 'Google User';
      sub = res.data.sub;
      picture = res.data.picture;
    } catch {
      // Fallback: verify ID token via google-auth-library
      try {
        const ticket = await googleClient.verifyIdToken({ idToken: accessToken });
        const payload = ticket.getPayload();
        if (payload && payload.email) {
          email = payload.email;
          name = payload.name || 'Google User';
          sub = payload.sub;
          picture = payload.picture || '';
        }
      } catch (e: any) {
        throw new Error(`Google authentication failed: ${e.message}`);
      }
    }

    if (!email) throw new Error('Could not retrieve email from Google');

    let user = await User.findOne({ email: email.toLowerCase(), isDeleted: false });
    if (!user) {
      user = await User.create({
        email: email.toLowerCase(),
        name,
        googleId: sub,
        image: picture,
        provider: 'GOOGLE',
        role: 'USER',
      });
    }

    const tokens = this.generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return {
      user: user.toJSON(),
      tokens,
    };
  }

  static async socialFacebook(accessToken: string) {
    if (!accessToken) throw new Error('Facebook access token is required');

    let fbData: any;
    try {
      const res = await axios.get('https://graph.facebook.com/me', {
        params: {
          fields: 'id,name,email,picture',
          access_token: accessToken,
        },
      });
      fbData = res.data;
    } catch (e: any) {
      throw new Error(`Facebook authentication failed: ${e.message}`);
    }

    const email = fbData.email || `${fbData.id}@facebook.user`;
    const name = fbData.name || 'Facebook User';
    const picture = fbData.picture?.data?.url || '';

    let user = await User.findOne({ email: email.toLowerCase(), isDeleted: false });
    if (!user) {
      user = await User.create({
        email: email.toLowerCase(),
        name,
        facebookId: fbData.id,
        image: picture,
        provider: 'FACEBOOK',
        role: 'USER',
      });
    }

    const tokens = this.generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return {
      user: user.toJSON(),
      tokens,
    };
  }

  static async logout(userId: string) {
    if (userId) {
      await User.findByIdAndUpdate(userId, { refreshToken: null });
    }
    return true;
  }
}
