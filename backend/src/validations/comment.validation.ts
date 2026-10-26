import Joi from 'joi';

export const createCommentSchema = Joi.object({
  postId: Joi.string().required().messages({
    'string.empty': 'Post ID is required',
  }),
  content: Joi.string().trim().min(1).max(2000).required().messages({
    'string.empty': 'Comment content is required',
  }),
  authorName: Joi.string().trim().max(100).optional(),
  authorEmail: Joi.string().email().optional(),
  parentId: Joi.string().allow(null, '').optional(),
});
