function MyGroupsSection({
  authUser,
  myGroups,
  setSelectedGroup,
  leaveGroup,
  selectedGroupInfo,
  groupEditForm,
  setGroupEditForm,
  updateGroup,
  groupMembers,
  removeMember
}) {
  return (
    <section className="panel panel-highlight">
      <h2>My Groups</h2>
      <p>View the study groups you currently belong to.</p>

      {authUser ? (
        myGroups.length ? (
          <>
            <div className="group-grid">
              {myGroups.map((group) => (
                <article key={group.id} className="group-card" onClick={() => setSelectedGroup(group.id)}>
                  <strong>{group.title}</strong>
                  <span className="tag">{group.course}</span>
                  <p>{group.description}</p>
                  <div className="meta-row">
                    <span>{group.location}</span>
                    <span>{group.members} members</span>
                  </div>
                  <button
                    className="primary-button"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      leaveGroup(group.id);
                    }}
                  >
                    Leave Group
                  </button>
                </article>
              ))}
            </div>

            {selectedGroupInfo?.leader?.id === authUser?.id && (
              <div className="session-form">
                <h3>Manage Selected Group (Leader)</h3>
                <input value={groupEditForm.title} onChange={(event) => setGroupEditForm({ ...groupEditForm, title: event.target.value })} placeholder="Group title" />
                <input value={groupEditForm.course} onChange={(event) => setGroupEditForm({ ...groupEditForm, course: event.target.value })} placeholder="Course name or code" />
                <input value={groupEditForm.location} onChange={(event) => setGroupEditForm({ ...groupEditForm, location: event.target.value })} placeholder="Meeting location or link" />
                <input value={groupEditForm.faculty} onChange={(event) => setGroupEditForm({ ...groupEditForm, faculty: event.target.value })} placeholder="Faculty (optional)" />
                <textarea rows="3" value={groupEditForm.description} onChange={(event) => setGroupEditForm({ ...groupEditForm, description: event.target.value })} placeholder="Study focus description" />
                <button className="primary-button" type="button" onClick={updateGroup}>Save Group Changes</button>

                <h4>Group Members</h4>
                {groupMembers.length ? (
                  groupMembers.map((member) => (
                    <div key={member.id} className="admin-card">
                      <p><strong>{member.name}</strong></p>
                      <p>{member.program} • Year {member.year}</p>
                      <p>{member.email}</p>
                      {member.id !== authUser?.id && (
                        <button className="primary-button" type="button" onClick={() => removeMember(member.id)}>
                          Remove Member
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="status">Select one of your groups to manage members.</div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="status">You are not a member of any groups yet. Join groups from Explore Groups.</div>
        )
      ) : (
        <div className="status">Login to see your groups.</div>
      )}
    </section>
  );
}

export default MyGroupsSection;
