function GroupsSection({
  loading,
  query,
  setQuery,
  filteredGroups,
  myGroups,
  setSelectedGroup,
  joinGroup
}) {
  return (
    <section className="panel panel-highlight panel-admin">
      <div className="panel-header">
        <div>
          <h2>Available Study Groups</h2>
          <p>Filter by course, faculty, or group title.</p>
        </div>
        <input
          className="search-input"
          placeholder="Search course, faculty, or group title"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {loading ? (
        <div className="status">Loading groups...</div>
      ) : (
        <div className="group-grid">
          {filteredGroups.length ? (
            filteredGroups.map((group) => {
              const joined = myGroups.some((item) => item.id === group.id);
              return (
                <article key={group.id} className="group-card">
                  <div className="group-card-content" onClick={() => setSelectedGroup(group.id)}>
                    <strong>{group.title}</strong>
                    <span className="tag">{group.course}</span>
                    <p>{group.description}</p>
                    <div className="meta-row">
                      <span>{group.location}</span>
                      <span>{group.members} members</span>
                    </div>
                  </div>
                  <button className="primary-button" type="button" onClick={() => joinGroup(group.id)} disabled={joined}>
                    {joined ? 'Joined' : 'Join Group'}
                  </button>
                </article>
              );
            })
          ) : (
            <div className="status">No study groups match your search.</div>
          )}
        </div>
      )}
    </section>
  );
}

export default GroupsSection;
