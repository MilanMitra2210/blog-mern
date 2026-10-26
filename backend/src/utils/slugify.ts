import slugifyPackage from 'slugify';

export const generateSlug = (text: string): string => {
  if (!text) return '';
  const slugifyFn = (slugifyPackage as any).default || slugifyPackage;
  return slugifyFn(text, {
    lower: true,
    strict: true,
    trim: true,
  });
};
