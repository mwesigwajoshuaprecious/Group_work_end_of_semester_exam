const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(3),
  program: z.string().min(2),
  year: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const groupSchema = z.object({
  title: z.string().min(3),
  course: z.string().min(2),
  description: z.string().min(10),
  location: z.string().min(2),
  faculty: z.string().optional()
});

const sessionSchema = z.object({
  groupId: z.string().min(1),
  title: z.string().min(3),
  date: z.string().min(8),
  time: z.string().min(4),
  location: z.string().min(2),
  description: z.string().min(10)
});

const postSchema = z.object({
  groupId: z.string().min(1),
  content: z.string().min(8)
});

const commentSchema = z.object({
  content: z.string().min(2),
  parentCommentId: z.number().int().positive().optional()
});

module.exports = {
  registerSchema,
  loginSchema,
  groupSchema,
  sessionSchema,
  postSchema,
  commentSchema
};
