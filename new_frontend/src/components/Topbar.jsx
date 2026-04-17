function Topbar({ authUser }) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Uganda Christian University</p>
        <h1>Student Study Group Finder</h1>
        {authUser && (
          <span className={`role-badge ${authUser.role === 'admin' ? 'role-admin' : 'role-student'}`}>
            {authUser.role === 'admin' ? 'Administrator View' : 'Student View'}
          </span>
        )}
      </div>
      <div className="hero-note">Discover groups, schedule sessions, create study sessions, and manage the platform.</div>
    </header>
  );
}

export default Topbar;
