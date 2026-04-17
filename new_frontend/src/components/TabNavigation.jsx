function TabNavigation({ activeTab, setActiveTab, isAdmin }) {
  return (
    <div className="tab-row">
      <button className={activeTab === 'groups' ? 'tab active' : 'tab'} onClick={() => setActiveTab('groups')}>
        {isAdmin ? 'Browse Groups' : 'Explore Groups'}
      </button>
      <button className={activeTab === 'create' ? 'tab active' : 'tab'} onClick={() => setActiveTab('create')}>
        Create Group
      </button>
      <button className={activeTab === 'mygroups' ? 'tab active' : 'tab'} onClick={() => setActiveTab('mygroups')}>
        My Groups
      </button>
      <button className={activeTab === 'dashboard' ? 'tab active' : 'tab'} onClick={() => setActiveTab('dashboard')}>
        Student Dashboard
      </button>
      <button className={activeTab === 'schedule' ? 'tab active' : 'tab'} onClick={() => setActiveTab('schedule')}>
        Schedule Session
      </button>
      <button className={activeTab === 'discussions' ? 'tab active' : 'tab'} onClick={() => setActiveTab('discussions')}>
        Discussions
      </button>
      {isAdmin && (
        <button className={activeTab === 'admin-dashboard' ? 'tab active' : 'tab'} onClick={() => setActiveTab('admin-dashboard')}>
          Admin Control Center
        </button>
      )}
      <button className={activeTab === 'account' ? 'tab active' : 'tab'} onClick={() => setActiveTab('account')}>
        Account
      </button>
    </div>
  );
}

export default TabNavigation;
