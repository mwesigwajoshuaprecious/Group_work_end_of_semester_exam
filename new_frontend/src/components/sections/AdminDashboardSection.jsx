function AdminDashboardSection({
  authUser,
  overview,
  adminUsers,
  promoteUser,
  adminGroups,
  deleteGroup
}) {
  return (
    <section className="panel panel-highlight">
      <h2>Administrator Overview</h2>
      {authUser?.role !== 'admin' ? (
        <div className="status">Administrator access is required to view this dashboard.</div>
      ) : overview ? (
        <>
          <div className="dashboard-grid">
            <div className="metric-card">
              <span>Total registered users</span>
              <strong>{overview.totalUsers}</strong>
            </div>
            <div className="metric-card">
              <span>Total study groups</span>
              <strong>{overview.totalGroups}</strong>
            </div>
            <div className="metric-card full-width">
              <span>Most active courses</span>
              <ul>
                {overview.activeCourses.map((item) => (
                  <li key={item.course}>{item.course} — {item.groups} groups</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="admin-section">
            <div className="metric-card full-width">
              <h3>User management</h3>
              {adminUsers.length ? (
                <div className="admin-grid">
                  {adminUsers.map((user) => (
                    <div key={user.id} className="admin-card">
                      <p><strong>{user.name}</strong></p>
                      <p>{user.email}</p>
                      <p>{user.program} • Year {user.year}</p>
                      <p>Role: {user.role}</p>
                      {user.role !== 'admin' && (
                        <button className="primary-button" type="button" onClick={() => promoteUser(user.id)}>
                          Promote to Admin
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="status">Loading users...</div>
              )}
            </div>

            <div className="metric-card full-width">
              <h3>Manage groups</h3>
              {adminGroups.length ? (
                <div className="admin-grid">
                  {adminGroups.map((group) => (
                    <div key={group.id} className="admin-card">
                      <p><strong>{group.title}</strong></p>
                      <p>{group.course}</p>
                      <p>Leader: {group.leader?.name || 'Unknown'}</p>
                      <p>{group.members} members</p>
                      <button className="primary-button" type="button" onClick={() => deleteGroup(group.id)}>
                        Delete Group
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="status">Loading groups...</div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="status">Loading dashboard details...</div>
      )}
    </section>
  );
}

export default AdminDashboardSection;
