function DiscussionsSection({
  selectedGroup,
  setSelectedGroup,
  groups,
  fieldErrors,
  setFieldErrors,
  selectedGroupInfo,
  newPost,
  setNewPost,
  createDiscussion,
  posts,
  splitComments,
  newReplies,
  setNewReplies,
  addReply,
  newComments,
  setNewComments,
  addComment,
  statusMessage
}) {
  return (
    <section className="panel panel-highlight">
      <h2>Group Discussions</h2>
      <p>Select a group to view and contribute to the discussion board.</p>

      <div className="discussion-controls">
        <select
          className="group-select"
          value={selectedGroup || ''}
          onChange={(event) => {
            setSelectedGroup(event.target.value ? Number(event.target.value) : null);
            setFieldErrors((prev) => ({ ...prev, postGroup: undefined }));
          }}
        >
          <option value="">Choose a group</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>{group.title}</option>
          ))}
        </select>
        {fieldErrors.postGroup && <p className="field-error">{fieldErrors.postGroup}</p>}
      </div>

      {selectedGroupInfo && (
        <div className="discussion-panel">
          <div className="discussion-post-form">
            <textarea
              rows="4"
              value={newPost}
              onChange={(event) => {
                setNewPost(event.target.value);
                setFieldErrors((prev) => ({ ...prev, postContent: undefined }));
              }}
              placeholder="Share an announcement or ask a question"
            />
            {fieldErrors.postContent && <p className="field-error">{fieldErrors.postContent}</p>}
            <button className="primary-button" onClick={createDiscussion}>Post Message</button>
          </div>

          <div className="discussion-feed">
            {posts.length ? (
              posts.map((post) => {
                const { topLevel, repliesByParent } = splitComments(post.comments || []);
                return (
                  <article key={post.id} className="discussion-card">
                    <div className="discussion-meta">
                      <strong>{post.author?.name || 'Anonymous'}</strong>
                      <span>{new Date(post.createdAt).toLocaleString()}</span>
                    </div>
                    <p>{post.content}</p>

                    <div className="comment-list">
                      {topLevel.map((comment) => (
                        <div key={comment.id} className="comment-item">
                          <div className="discussion-meta">
                            <strong>{comment.author?.name || 'Anonymous'}</strong>
                            <span>{new Date(comment.createdAt).toLocaleString()}</span>
                          </div>
                          <p>{comment.content}</p>

                          {(repliesByParent[String(comment.id)] || []).map((reply) => (
                            <div key={reply.id} className="comment-item reply-item">
                              <div className="discussion-meta">
                                <strong>{reply.author?.name || 'Anonymous'}</strong>
                                <span>{new Date(reply.createdAt).toLocaleString()}</span>
                              </div>
                              <p>{reply.content}</p>
                            </div>
                          ))}

                          <div className="comment-form reply-form">
                            <input
                              value={newReplies[`${post.id}-${comment.id}`] || ''}
                              onChange={(event) => {
                                setNewReplies((prev) => ({ ...prev, [`${post.id}-${comment.id}`]: event.target.value }));
                                setFieldErrors((prev) => ({ ...prev, [`reply-${post.id}-${comment.id}`]: undefined }));
                              }}
                              placeholder="Write a reply..."
                            />
                            {fieldErrors[`reply-${post.id}-${comment.id}`] && <p className="field-error">{fieldErrors[`reply-${post.id}-${comment.id}`]}</p>}
                            <button className="primary-button" type="button" onClick={() => addReply(post.id, comment.id)}>
                              Reply
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="comment-form">
                      <input
                        value={newComments[post.id] || ''}
                        onChange={(event) => {
                          setNewComments((prev) => ({ ...prev, [post.id]: event.target.value }));
                          setFieldErrors((prev) => ({ ...prev, [`comment-${post.id}`]: undefined }));
                        }}
                        placeholder="Write a comment..."
                      />
                      {fieldErrors[`comment-${post.id}`] && <p className="field-error">{fieldErrors[`comment-${post.id}`]}</p>}
                      <button className="primary-button" type="button" onClick={() => addComment(post.id)}>
                        Comment
                      </button>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="status">No posts yet. Be the first to start the discussion.</div>
            )}
          </div>
        </div>
      )}

      {!!statusMessage && <div className="status notice">{statusMessage}</div>}
    </section>
  );
}

export default DiscussionsSection;
