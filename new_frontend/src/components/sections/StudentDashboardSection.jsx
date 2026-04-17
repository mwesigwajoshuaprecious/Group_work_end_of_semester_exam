function StudentDashboardSection({ authUser, studentOverview }) {
  return (
    <section className="panel panel-highlight">
      <h2>Student Dashboard</h2>
      <p>See your groups, upcoming sessions, and recently created study groups in one place.</p>

      {!authUser ? (
        <div className="status">Login to view your dashboard.</div>
      ) : studentOverview ? (
        <>
          <div className="dashboard-grid">
            <div className="metric-card">
              <span>My groups</span>
              <strong>{studentOverview.myGroups.length}</strong>
            </div>
            <div className="metric-card">
              <span>Upcoming sessions</span>
              <strong>{studentOverview.upcomingSessions.length}</strong>
            </div>
            <div className="metric-card full-width">
              <span>Recent groups</span>
              <strong>{studentOverview.recentGroups.length}</strong>
            </div>
          </div>

          <div className="admin-section">
            <div className="metric-card full-width">
              <h3>Study groups you belong to</h3>
              {studentOverview.myGroups.length ? (
                <div className="group-grid">
                  {studentOverview.myGroups.map((group) => (
                    <article key={group.id} className="group-card">
                      <strong>{group.title}</strong>
                      <span className="tag">{group.course}</span>
                      <p>{group.description}</p>
                      <div className="meta-row">
                        <span>{group.location}</span>
                        <span>{group.members} members</span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="status">You are not a member of any groups yet.</div>
              )}
            </div>

            <div className="metric-card full-width">
              <h3>Upcoming study sessions</h3>
              {studentOverview.upcomingSessions.length ? (
                studentOverview.upcomingSessions.map((session) => (
                  <article key={`${session.id}-${session.groupId}`} className="discussion-card">
                    <div className="discussion-meta">
                      <strong>{session.title}</strong>
                      <span>{session.date} @ {session.time}</span>
                    </div>
                    <p className="tag">{session.groupTitle}</p>
                    <p>{session.location}</p>
                    <p>{session.description}</p>
                  </article>
                ))
              ) : (
                <div className="status">No upcoming sessions found.</div>
              )}
            </div>

            <div className="metric-card full-width">
              <h3>Recently created groups</h3>
              {studentOverview.recentGroups.length ? (
                <div className="group-grid">
                  {studentOverview.recentGroups.map((group) => (
                    <article key={group.id} className="group-card">
                      <strong>{group.title}</strong>
                      <span className="tag">{group.course}</span>
                      <p>{group.description}</p>
                      <div className="meta-row">
                        <span>{group.location}</span>
                        <span>{group.members} members</span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="status">No recently created groups available.</div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="status">Loading your dashboard...</div>
      )}
    </section>
  );
}

export default StudentDashboardSection;
