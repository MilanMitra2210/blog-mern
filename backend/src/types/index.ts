import { Request } from 'express';

export type UserRole = 'ADMIN' | 'USER';
export type ProviderType = 'MANUAL' | 'GOOGLE' | 'FACEBOOK' | 'APPLE' | 'LINKEDIN';

export interface IUserPayload {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  roleId?: string | null;
  permissions?: string[];
}

export interface AuthRequest extends Request {
  user?: IUserPayload;
}

export interface ISEOData {
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  canonicalUrl?: string;
  keywords?: string[];
  metaKeywords?: string;
  metaRobots?: string;
  metaImageId?: any;
  metaImage?: any;
  jsonLd?: any[];
  ogImage?: string;
}

export interface IBlogSection {
  id?: string;
  title?: string;
  content?: string | any;
  displayOrder?: number;
  subSections?: {
    id?: string;
    title?: string;
    content?: string | any;
    displayOrder?: number;
  }[];
}

export interface ITokenPair {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
}
