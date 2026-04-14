import { useEffect, useMemo, useState } from 'react';

function App() {
  const programOptions = [
    'Bachelor of Science in Computer Science',
    'Bachelor of Information Technology',
    'Bachelor of Data Science',
    'Bachelor of Business Administration',
    'Bachelor of Accounting and Finance',
    'Bachelor of Procurement and Logistics Management',
    'Bachelor of Laws',
    'Bachelor of Arts in Education',
    'Bachelor of Science in Nursing',
    'Bachelor of Public Health',
    'Bachelor of Agriculture and Community Development',
    'Bachelor of Theology'
  ];

  const yearOptions = ['1', '2', '3', '4'];

  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [posts, setPosts] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [overview, setOverview] = useState(null);
  const [studentOverview, setStudentOverview] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminGroups, setAdminGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('groups');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newPost, setNewPost] = useState('');
  const [newComments, setNewComments] = useState({});
  const [newReplies, setNewReplies] = useState({});
  const [groupEditForm, setGroupEditForm] = useState({ title: '', course: '', description: '', location: '', faculty: '' });
  const [groupMembers, setGroupMembers] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [groupForm, setGroupForm] = useState({ title: '', course: '', description: '', location: '', faculty: '' });
  const [sessionForm, setSessionForm] = useState({ title: '', date: '', time: '', location: '', description: '' });
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', program: '', year: '', email: '', password: '' });
  const [authUser, setAuthUser] = useState(null);
  const isAdmin = authUser?.role === 'admin';

  const loadGroups = async () => {
    const groupsData = await fetch('/api/groups').then((res) => res.json());
    setGroups(groupsData);
  };

  const loadMyGroups = async (token) => {
    if (!token) {
      setMyGroups([]);
      return;
    }

    const response = await fetch('/api/groups/my', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.ok) {
      setMyGroups(await response.json());
    } else {
      setMyGroups([]);
    }
  };

  const loadAdminOverview = async (token) => {
    const response = await fetch('/api/admin/overview', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.ok) {
      setOverview(await response.json());
    } else {
      setOverview(null);
    }
  };

  const loadStudentOverview = async (token) => {
    const response = await fetch('/api/dashboard/overview', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.ok) {
      setStudentOverview(await response.json());
    } else {
      setStudentOverview(null);
    }
  };

  const loadAdminLists = async (token) => {
    const [usersRes, groupsRes] = await Promise.all([
      fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('/api/admin/groups', { headers: { Authorization: `Bearer ${token}` } })
    ]);

    if (usersRes.ok) setAdminUsers(await usersRes.json());
    if (groupsRes.ok) setAdminGroups(await groupsRes.json());
  };

  useEffect(() => {
    const token = window.localStorage.getItem('studyGroupToken');
    const authPromise = token
      ? fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
          .then((res) => (res.ok ? res.json() : null))
          .catch(() => null)
      : Promise.resolve(null);

    Promise.all([loadGroups(), authPromise])
      .then(([, authData]) => {
        if (authData?.user) {
          setAuthUser(authData.user);
          loadMyGroups(token);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      const token = window.localStorage.getItem('studyGroupToken');
      if (!token) {
        setStudentOverview(null);
        return;
      }
      loadStudentOverview(token);
    }

    if (activeTab === 'admin-dashboard' && authUser?.role === 'admin') {
      const token = window.localStorage.getItem('studyGroupToken');
      loadAdminOverview(token);
      loadAdminLists(token);
    }
  }, [activeTab, authUser]);

  useEffect(() => {
    if (!selectedGroup) {
      setPosts([]);
      setSessions([]);
      return;
    }

    fetch(`/api/posts/group/${selectedGroup}`)
      .then((res) => res.json())
      .then(setPosts)
      .catch(() => setPosts([]));

    fetch(`/api/sessions/group/${selectedGroup}`)
      .then((res) => res.json())
      .then(setSessions)
      .catch(() => setSessions([]));
  }, [selectedGroup]);

  useEffect(() => {
    if (!selectedGroupInfo) {
      setGroupMembers([]);
      return;
    }

    setGroupEditForm({
      title: selectedGroupInfo.title || '',
      course: selectedGroupInfo.course || '',
      description: selectedGroupInfo.description || '',
      location: selectedGroupInfo.location || '',
      faculty: selectedGroupInfo.faculty || ''
    });

    if (selectedGroupInfo.leader?.id === authUser?.id) {
      loadLeaderMembers(selectedGroupInfo.id);
    } else {
      setGroupMembers([]);
    }
  }, [selectedGroup, groups, myGroups, authUser]);

  const filteredGroups = useMemo(() => {
    return groups.filter((group) =>
      [group.title, group.course, group.faculty].some((value) =>
        value?.toLowerCase().includes(query.toLowerCase())
      )
    );
  }, [groups, query]);

  const selectedGroupInfo =
    groups.find((group) => String(group.id) === String(selectedGroup)) ||
    myGroups.find((group) => String(group.id) === String(selectedGroup));

  const splitComments = (comments = []) => {
    const topLevel = comments.filter((comment) => !comment.parentCommentId);
    const repliesByParent = comments.reduce((accumulator, comment) => {
      if (comment.parentCommentId) {
        const key = String(comment.parentCommentId);
        accumulator[key] = accumulator[key] || [];
        accumulator[key].push(comment);
      }
      return accumulator;
    }, {});
    return { topLevel, repliesByParent };
  };

  const validateGroupForm = () => {
    const errors = {};
    if (!groupForm.title.trim()) errors.groupTitle = 'Group title is required.';
    if (!groupForm.course.trim()) errors.groupCourse = 'Course name or code is required.';
    if (!groupForm.location.trim()) errors.groupLocation = 'Meeting location is required.';
    if (!groupForm.description.trim()) errors.groupDescription = 'Description is required.';
    else if (groupForm.description.trim().length < 10) errors.groupDescription = 'Description must be at least 10 characters.';
    return errors;
  };

  const validateSessionForm = () => {
    const errors = {};
    if (!selectedGroup) errors.sessionGroup = 'Please choose a group.';
    if (!sessionForm.title.trim()) errors.sessionTitle = 'Session title is required.';
    if (!sessionForm.date) errors.sessionDate = 'Session date is required.';
    if (!sessionForm.time) errors.sessionTime = 'Session time is required.';
    if (!sessionForm.location.trim()) errors.sessionLocation = 'Session location is required.';
    if (!sessionForm.description.trim()) errors.sessionDescription = 'Session description is required.';
    return errors;
  };

  const validateAuthForm = () => {
    const errors = {};
    if (authMode === 'register') {
      if (!authForm.name.trim()) errors.authName = 'Full name is required.';
      if (!authForm.program.trim()) errors.authProgram = 'Program is required.';
      if (!authForm.year.trim()) errors.authYear = 'Year of study is required.';
    }
    if (!authForm.email.trim()) errors.authEmail = 'Email is required.';
    if (!authForm.password.trim()) errors.authPassword = 'Password is required.';
    return errors;
  };

  const setMessage = (message) => {
    setStatusMessage(message);
    window.setTimeout(() => setStatusMessage(''), 5000);
  };

  const createDiscussion = async () => {
    const token = window.localStorage.getItem('studyGroupToken');
    if (!token) {
      setMessage('Please login to post in the discussion board.');
      return;
    }
    if (!selectedGroup || !newPost.trim()) {
      setFieldErrors((prev) => ({
        ...prev,
        postContent: !newPost.trim() ? 'Post message cannot be empty.' : undefined,
        postGroup: !selectedGroup ? 'Choose a group first.' : undefined
      }));
      setMessage('Choose a group and write a message.');
      return;
    }
    setFieldErrors((prev) => ({ ...prev, postContent: undefined, postGroup: undefined }));

    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ groupId: selectedGroup, content: newPost })
    });

    if (response.ok) {
      setNewPost('');
      setMessage('Discussion post saved successfully.');
      const updatedPosts = await fetch(`/api/posts/group/${selectedGroup}`).then((res) => res.json());
      setPosts(updatedPosts);
    } else {
      const data = await response.json();
      setMessage(data.error || 'Unable to save discussion post.');
    }
  };

  const addComment = async (postId) => {
    const token = window.localStorage.getItem('studyGroupToken');
    if (!token) {
      setMessage('Please login to comment.');
      return;
    }

    const content = (newComments[postId] || '').trim();
    if (!content) {
      setFieldErrors((prev) => ({ ...prev, [`comment-${postId}`]: 'Comment cannot be empty.' }));
      setMessage('Write a comment first.');
      return;
    }
    setFieldErrors((prev) => ({ ...prev, [`comment-${postId}`]: undefined }));

    const response = await fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ content })
    });

    if (response.ok) {
      setNewComments((prev) => ({ ...prev, [postId]: '' }));
      const updatedPosts = await fetch(`/api/posts/group/${selectedGroup}`).then((res) => res.json());
      setPosts(updatedPosts);
    } else {
      const data = await response.json();
      setMessage(data.error || 'Unable to save comment.');
    }
  };

  const addReply = async (postId, parentCommentId) => {
    const token = window.localStorage.getItem('studyGroupToken');
    if (!token) {
      setMessage('Please login to comment.');
      return;
    }

    const key = `${postId}-${parentCommentId}`;
    const content = (newReplies[key] || '').trim();
    if (!content) {
      setFieldErrors((prev) => ({ ...prev, [`reply-${postId}-${parentCommentId}`]: 'Reply cannot be empty.' }));
      setMessage('Write a reply first.');
      return;
    }
    setFieldErrors((prev) => ({ ...prev, [`reply-${postId}-${parentCommentId}`]: undefined }));

    const response = await fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ content, parentCommentId })
    });

    if (response.ok) {
      setNewReplies((prev) => ({ ...prev, [key]: '' }));
      const updatedPosts = await fetch(`/api/posts/group/${selectedGroup}`).then((res) => res.json());
      setPosts(updatedPosts);
    } else {
      const data = await response.json();
      setMessage(data.error || 'Unable to save reply.');
    }
  };

  const createGroup = async () => {
    const token = window.localStorage.getItem('studyGroupToken');
    if (!token) {
      setMessage('Login to create a new study group.');
      return;
    }

    const validation = validateGroupForm();
    if (Object.keys(validation).length) {
      setFieldErrors((prev) => ({ ...prev, ...validation }));
      setMessage('Please fix the highlighted group form fields.');
      return;
    }
    setFieldErrors((prev) => ({
      ...prev,
      groupTitle: undefined,
      groupCourse: undefined,
      groupLocation: undefined,
      groupDescription: undefined
    }));

    const response = await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(groupForm)
    });

    if (response.ok) {
      setGroupForm({ title: '', course: '', description: '', location: '', faculty: '' });
      await loadGroups();
      await loadMyGroups(token);
      setMessage('Study group created successfully.');
      setActiveTab('mygroups');
    } else {
      const data = await response.json();
      setMessage(data.error || 'Unable to create study group.');
    }
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    const validation = validateAuthForm();
    if (Object.keys(validation).length) {
      setFieldErrors((prev) => ({ ...prev, ...validation }));
      setMessage('Please complete all required account fields.');
      return;
    }
    setFieldErrors((prev) => ({
      ...prev,
      authName: undefined,
      authProgram: undefined,
      authYear: undefined,
      authEmail: undefined,
      authPassword: undefined
    }));
    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authForm)
    });

    const data = await response.json();
    if (response.ok) {
      window.localStorage.setItem('studyGroupToken', data.token);
      setAuthUser(data.user);
      loadMyGroups(data.token);
      setAuthForm({ name: '', program: '', year: '', email: '', password: '' });
      setMessage(`${authMode === 'login' ? 'Logged in' : 'Registered'} successfully.`);
    } else {
      setMessage(data.error || 'Authentication failed.');
    }
  };

  const handleCreateSession = async () => {
    const token = window.localStorage.getItem('studyGroupToken');
    if (!token) {
      setMessage('Login to schedule a study session.');
      return;
    }
    const validation = validateSessionForm();
    if (Object.keys(validation).length) {
      setFieldErrors((prev) => ({ ...prev, ...validation }));
      setMessage('Please fix the highlighted session fields.');
      return;
    }
    setFieldErrors((prev) => ({
      ...prev,
      sessionGroup: undefined,
      sessionTitle: undefined,
      sessionDate: undefined,
      sessionTime: undefined,
      sessionLocation: undefined,
      sessionDescription: undefined
    }));

    const response = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ groupId: selectedGroup, ...sessionForm })
    });

    if (response.ok) {
      setSessionForm({ title: '', date: '', time: '', location: '', description: '' });
      const updatedSessions = await fetch(`/api/sessions/group/${selectedGroup}`).then((res) => res.json());
      setSessions(updatedSessions);
      setMessage('Study session scheduled successfully.');
    } else {
      const data = await response.json();
      setMessage(data.error || 'Failed to schedule session.');
    }
  };

  const joinGroup = async (groupId) => {
    const token = window.localStorage.getItem('studyGroupToken');
    if (!token) {
      setMessage('Login to join this group.');
      return;
    }

    const response = await fetch(`/api/groups/${groupId}/join`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.ok) {
      await loadMyGroups(token);
      await loadGroups();
      setMessage('Successfully joined the group.');
    } else {
      const data = await response.json();
      setMessage(data.error || 'Unable to join the group.');
    }
  };

  const leaveGroup = async (groupId) => {
    const token = window.localStorage.getItem('studyGroupToken');
    if (!token) {
      setMessage('Login to leave this group.');
      return;
    }

    const response = await fetch(`/api/groups/${groupId}/leave`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.ok) {
      if (String(selectedGroup) === String(groupId)) {
        setSelectedGroup(null);
      }
      await loadMyGroups(token);
      await loadGroups();
      setMessage('You left the group successfully.');
    } else {
      const data = await response.json();
      setMessage(data.error || 'Unable to leave the group.');
    }
  };

  const updateGroup = async () => {
    const token = window.localStorage.getItem('studyGroupToken');
    if (!token || !selectedGroupInfo) {
      return;
    }

    const response = await fetch(`/api/groups/${selectedGroupInfo.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(groupEditForm)
    });

    if (response.ok) {
      await loadGroups();
      await loadMyGroups(token);
      setMessage('Group updated successfully.');
    } else {
      const data = await response.json();
      setMessage(data.error || 'Unable to update group.');
    }
  };

  const loadLeaderMembers = async (groupId) => {
    const token = window.localStorage.getItem('studyGroupToken');
    if (!token || !groupId) {
      setGroupMembers([]);
      return;
    }

    const response = await fetch(`/api/groups/${groupId}/members`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.ok) {
      const data = await response.json();
      setGroupMembers(data.members || []);
    } else {
      setGroupMembers([]);
    }
  };

  const removeMember = async (memberId) => {
    const token = window.localStorage.getItem('studyGroupToken');
    if (!token || !selectedGroupInfo) {
      return;
    }

    const response = await fetch(`/api/groups/${selectedGroupInfo.id}/remove-member`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ memberId })
    });

    if (response.ok) {
      await loadLeaderMembers(selectedGroupInfo.id);
      await loadGroups();
      await loadMyGroups(token);
      setMessage('Member removed successfully.');
    } else {
      const data = await response.json();
      setMessage(data.error || 'Unable to remove member.');
    }
  };

  const deleteGroup = async (groupId) => {
    const token = window.localStorage.getItem('studyGroupToken');
    if (!token) {
      setMessage('Admin login required.');
      return;
    }

    const response = await fetch(`/api/admin/groups/${groupId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.ok) {
      await loadAdminLists(token);
      await loadGroups();
      setMessage('Group deleted successfully.');
    } else {
      const data = await response.json();
      setMessage(data.error || 'Unable to delete group.');
    }
  };

  const promoteUser = async (userId) => {
    const token = window.localStorage.getItem('studyGroupToken');
    if (!token) {
      setMessage('Admin login required.');
      return;
    }

    const response = await fetch(`/api/admin/users/${userId}/promote`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.ok) {
      await loadAdminLists(token);
      setMessage('User promoted to admin.');
    } else {
      const data = await response.json();
      setMessage(data.error || 'Unable to promote user.');
    }
  };

  const handleLogout = () => {
    window.localStorage.removeItem('studyGroupToken');
    setAuthUser(null);
    setMyGroups([]);
    setOverview(null);
    setAdminUsers([]);
    setAdminGroups([]);
    setStatusMessage('Logged out successfully.');
  };

  return (
    <div className={`app-shell ${authUser?.role === 'admin' ? 'admin-mode' : ''}`}>
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
        {authUser?.role === 'admin' && (
          <button className={activeTab === 'admin-dashboard' ? 'tab active' : 'tab'} onClick={() => setActiveTab('admin-dashboard')}>
            Admin Control Center
          </button>
        )}
        <button className={activeTab === 'account' ? 'tab active' : 'tab'} onClick={() => setActiveTab('account')}>
          Account
        </button>
      </div>

      <main className="page-content">
        {activeTab === 'groups' && (
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
        )}

        {activeTab === 'create' && (
          <section className="panel panel-highlight">
            <h2>Create a Study Group</h2>
            {authUser ? (
              <div className="session-form">
                <input
                  value={groupForm.title}
                  placeholder="Group title"
                  onChange={(event) => {
                    setGroupForm({ ...groupForm, title: event.target.value });
                    setFieldErrors((prev) => ({ ...prev, groupTitle: undefined }));
                  }}
                />
                {fieldErrors.groupTitle && <p className="field-error">{fieldErrors.groupTitle}</p>}
                <input
                  value={groupForm.course}
                  placeholder="Course name or code"
                  onChange={(event) => {
                    setGroupForm({ ...groupForm, course: event.target.value });
                    setFieldErrors((prev) => ({ ...prev, groupCourse: undefined }));
                  }}
                />
                {fieldErrors.groupCourse && <p className="field-error">{fieldErrors.groupCourse}</p>}
                <input
                  value={groupForm.location}
                  placeholder="Meeting location or link"
                  onChange={(event) => {
                    setGroupForm({ ...groupForm, location: event.target.value });
                    setFieldErrors((prev) => ({ ...prev, groupLocation: undefined }));
                  }}
                />
                {fieldErrors.groupLocation && <p className="field-error">{fieldErrors.groupLocation}</p>}
                <input
                  value={groupForm.faculty}
                  placeholder="Faculty (optional)"
                  onChange={(event) => setGroupForm({ ...groupForm, faculty: event.target.value })}
                />
                <textarea
                  rows="4"
                  value={groupForm.description}
                  placeholder="Short description of the study focus"
                  onChange={(event) => {
                    setGroupForm({ ...groupForm, description: event.target.value });
                    setFieldErrors((prev) => ({ ...prev, groupDescription: undefined }));
                  }}
                />
                {fieldErrors.groupDescription && <p className="field-error">{fieldErrors.groupDescription}</p>}
                <button className="primary-button" type="button" onClick={createGroup}>
                  Create Group
                </button>
              </div>
            ) : (
              <div className="status">Login to create a study group.</div>
            )}
          </section>
        )}

        {activeTab === 'mygroups' && (
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
        )}

        {activeTab === 'dashboard' && (
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
        )}

        {activeTab === 'schedule' && (
          <section className="panel panel-highlight">
            <h2>Schedule a Study Session</h2>
            <p>Group leaders can create session details for their selected groups.</p>

            <div className="discussion-controls">
              <select className="group-select" value={selectedGroup || ''} onChange={(event) => setSelectedGroup(event.target.value ? Number(event.target.value) : null)}>
                <option value="">Choose a group</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>{group.title}</option>
                ))}
              </select>
              {fieldErrors.sessionGroup && <p className="field-error">{fieldErrors.sessionGroup}</p>}
            </div>

            <div className="session-form">
              <input
                type="text"
                placeholder="Session title"
                value={sessionForm.title}
                onChange={(event) => {
                  setSessionForm({ ...sessionForm, title: event.target.value });
                  setFieldErrors((prev) => ({ ...prev, sessionTitle: undefined }));
                }}
              />
              {fieldErrors.sessionTitle && <p className="field-error">{fieldErrors.sessionTitle}</p>}
              <div className="session-row">
                <input
                  type="date"
                  value={sessionForm.date}
                  onChange={(event) => {
                    setSessionForm({ ...sessionForm, date: event.target.value });
                    setFieldErrors((prev) => ({ ...prev, sessionDate: undefined }));
                  }}
                />
                <input
                  type="time"
                  value={sessionForm.time}
                  onChange={(event) => {
                    setSessionForm({ ...sessionForm, time: event.target.value });
                    setFieldErrors((prev) => ({ ...prev, sessionTime: undefined }));
                  }}
                />
              </div>
              {(fieldErrors.sessionDate || fieldErrors.sessionTime) && <p className="field-error">{fieldErrors.sessionDate || fieldErrors.sessionTime}</p>}
              <input
                type="text"
                placeholder="Location or meeting link"
                value={sessionForm.location}
                onChange={(event) => {
                  setSessionForm({ ...sessionForm, location: event.target.value });
                  setFieldErrors((prev) => ({ ...prev, sessionLocation: undefined }));
                }}
              />
              {fieldErrors.sessionLocation && <p className="field-error">{fieldErrors.sessionLocation}</p>}
              <textarea
                rows="4"
                placeholder="Brief description of the session"
                value={sessionForm.description}
                onChange={(event) => {
                  setSessionForm({ ...sessionForm, description: event.target.value });
                  setFieldErrors((prev) => ({ ...prev, sessionDescription: undefined }));
                }}
              />
              {fieldErrors.sessionDescription && <p className="field-error">{fieldErrors.sessionDescription}</p>}
              <button className="primary-button" onClick={handleCreateSession}>Create Session</button>
            </div>

            <div className="session-list">
              <h3>Upcoming Sessions</h3>
              {sessions.length ? (
                sessions.map((item) => (
                  <article key={item.id} className="discussion-card">
                    <div className="discussion-meta">
                      <strong>{item.title}</strong>
                      <span>{item.date} @ {item.time}</span>
                    </div>
                    <p>{item.location}</p>
                    <p>{item.description}</p>
                  </article>
                ))
              ) : (
                <div className="status">Select a group or add a session to see upcoming meetings.</div>
              )}
            </div>
          </section>
        )}

        {activeTab === 'discussions' && (
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
        )}

        {activeTab === 'admin-dashboard' && (
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
        )}

        {activeTab === 'account' && (
          <section className="panel panel-highlight">
            <h2>{authUser ? 'Your Account' : 'Login or Register'}</h2>
            {authUser ? (
              <div className="account-card">
                <p><strong>Name:</strong> {authUser.name}</p>
                <p><strong>Program:</strong> {authUser.program}</p>
                <p><strong>Year:</strong> {authUser.year}</p>
                <p><strong>Email:</strong> {authUser.email}</p>
                <p><strong>Role:</strong> {authUser.role || 'student'}</p>
                <button className="primary-button" type="button" onClick={handleLogout}>Logout</button>
              </div>
            ) : (
              <form className="auth-form" onSubmit={handleAuthSubmit}>
                <div className="auth-toggles">
                  <button type="button" className={authMode === 'login' ? 'tab active' : 'tab'} onClick={() => setAuthMode('login')}>
                    Login
                  </button>
                  <button type="button" className={authMode === 'register' ? 'tab active' : 'tab'} onClick={() => setAuthMode('register')}>
                    Register
                  </button>
                </div>

                {authMode === 'register' && (
                  <>
                    <input
                      value={authForm.name}
                      placeholder="Full name"
                      onChange={(event) => {
                        setAuthForm({ ...authForm, name: event.target.value });
                        setFieldErrors((prev) => ({ ...prev, authName: undefined }));
                      }}
                    />
                    {fieldErrors.authName && <p className="field-error">{fieldErrors.authName}</p>}
                    <select
                      className="group-select"
                      value={authForm.program}
                      onChange={(event) => {
                        setAuthForm({ ...authForm, program: event.target.value });
                        setFieldErrors((prev) => ({ ...prev, authProgram: undefined }));
                      }}
                    >
                      <option value="">Select program of study</option>
                      {programOptions.map((program) => (
                        <option key={program} value={program}>{program}</option>
                      ))}
                    </select>
                    {fieldErrors.authProgram && <p className="field-error">{fieldErrors.authProgram}</p>}
                    <select
                      className="group-select"
                      value={authForm.year}
                      onChange={(event) => {
                        setAuthForm({ ...authForm, year: event.target.value });
                        setFieldErrors((prev) => ({ ...prev, authYear: undefined }));
                      }}
                    >
                      <option value="">Select year of study</option>
                      {yearOptions.map((year) => (
                        <option key={year} value={year}>Year {year}</option>
                      ))}
                    </select>
                    {fieldErrors.authYear && <p className="field-error">{fieldErrors.authYear}</p>}
                  </>
                )}

                <input
                  type="email"
                  value={authForm.email}
                  placeholder="Email address"
                  onChange={(event) => {
                    setAuthForm({ ...authForm, email: event.target.value });
                    setFieldErrors((prev) => ({ ...prev, authEmail: undefined }));
                  }}
                />
                {fieldErrors.authEmail && <p className="field-error">{fieldErrors.authEmail}</p>}
                <input
                  type="password"
                  value={authForm.password}
                  placeholder="Password"
                  onChange={(event) => {
                    setAuthForm({ ...authForm, password: event.target.value });
                    setFieldErrors((prev) => ({ ...prev, authPassword: undefined }));
                  }}
                />
                {fieldErrors.authPassword && <p className="field-error">{fieldErrors.authPassword}</p>}
                <button className="primary-button" type="submit">
                  {authMode === 'login' ? 'Login' : 'Create account'}
                </button>
              </form>
            )}

            {!!statusMessage && <div className="status notice">{statusMessage}</div>}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
