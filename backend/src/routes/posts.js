const express = require('express');
const { Post, Group, Comment } = require('../models');
const { requireAuth } = require('../middleware/auth');
const { postSchema, commentSchema } = require('../utils/validate');

const router = express.Router();

router.get('/group/:groupId', async (req, res) => {
  const posts = await Post.findAll({
    where: { groupId: req.params.groupId },
    include: [
      { association: 'author', attributes: ['id', 'name'] },
      {
        model: Comment,
        as: 'comments',
        include: [{ association: 'author', attributes: ['id', 'name'] }],
        order: [['createdAt', 'ASC']]
      }
    ],
    order: [['createdAt', 'DESC']]
  });
  res.json(posts);
});

router.post('/', requireAuth, async (req, res) => {
  const parseResult = postSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.flatten().fieldErrors });
  }

  const { groupId, content } = parseResult.data;
  const group = await Group.findByPk(groupId);
  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }

  const isMember = await group.hasMember(req.userId);
  if (!isMember) {
    return res.status(403).json({ error: 'Only group members can post in the discussion' });
  }

  const post = await Post.create({ groupId, authorId: req.userId, content });
  res.status(201).json(post);
});

router.post('/:id/comments', requireAuth, async (req, res) => {
  const parseResult = commentSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.flatten().fieldErrors });
  }

  const post = await Post.findByPk(req.params.id);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const group = await Group.findByPk(post.groupId);
  const isMember = await group.hasMember(req.userId);
  if (!isMember) {
    return res.status(403).json({ error: 'Only group members can comment in the discussion' });
  }

  const { content, parentCommentId } = parseResult.data;

  if (parentCommentId) {
    const parentComment = await Comment.findByPk(parentCommentId);
    if (!parentComment || parentComment.postId !== post.id) {
      return res.status(400).json({ error: 'Reply target is invalid' });
    }
  }

  const comment = await Comment.create({
    postId: post.id,
    authorId: req.userId,
    content,
    parentCommentId: parentCommentId || null
  });
  res.status(201).json(comment);
});

module.exports = router;
