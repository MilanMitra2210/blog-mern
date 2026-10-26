export interface IPermissionItem {
  key: string;
  label: string;
  group: string;
}

export const AVAILABLE_PERMISSIONS: IPermissionItem[] = [
  // Blog Post Management
  { key: 'blogs:read', label: 'View Blog Posts', group: 'Post Management' },
  { key: 'blogs:write', label: 'Create, Edit & Delete Posts', group: 'Post Management' },
  { key: 'categories:read', label: 'View Categories & Tags', group: 'Post Management' },
  { key: 'categories:write', label: 'Manage Categories & Tags', group: 'Post Management' },

  // Comments Management
  { key: 'comments:read', label: 'View Comments', group: 'Comment Management' },
  { key: 'comments:write', label: 'Moderate & Delete Comments', group: 'Comment Management' },

  // User Management
  { key: 'users:read', label: 'View User Accounts', group: 'User Management' },
  { key: 'users:write', label: 'Manage All Users', group: 'User Management' },

  // Media Management
  { key: 'media:read', label: 'View Media Assets', group: 'Media Management' },
  { key: 'media:write', label: 'Upload & Delete Media', group: 'Media Management' },

  // Roles & Permissions
  { key: 'roles:read', label: 'View Roles & Access Policies', group: 'Roles & Access' },
  { key: 'roles:write', label: 'Manage Role Definitions', group: 'Roles & Access' },
];

export const ALL_PERMISSION_KEYS = AVAILABLE_PERMISSIONS.map((p) => p.key);

export const DEFAULT_USER_PERMISSIONS = [
  'blogs:read',
  'blogs:write',
  'categories:read',
  'comments:read',
  'comments:write',
  'media:read',
  'media:write',
];
