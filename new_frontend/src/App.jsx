import { useEffect, useMemo, useState } from 'react';
import { programOptions, yearOptions } from './constants/authOptions';
import Topbar from './components/Topbar';
import TabNavigation from './components/TabNavigation';
import AccountSection from './components/sections/AccountSection';
import GroupsSection from './components/sections/GroupsSection';
import CreateGroupSection from './components/sections/CreateGroupSection';
import MyGroupsSection from './components/sections/MyGroupsSection';
import StudentDashboardSection from './components/sections/StudentDashboardSection';
import ScheduleSection from './components/sections/ScheduleSection';
import DiscussionsSection from './components/sections/DiscussionsSection';
import AdminDashboardSection from './components/sections/AdminDashboardSection';

function App() {
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

  const clearFieldError = (key) => {
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
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
      <Topbar authUser={authUser} />
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} isAdmin={isAdmin} />

      <main className="page-content">
        {activeTab === 'groups' && (
          <GroupsSection
            loading={loading}
            query={query}
            setQuery={setQuery}
            filteredGroups={filteredGroups}
            myGroups={myGroups}
            setSelectedGroup={setSelectedGroup}
            joinGroup={joinGroup}
          />
        )}

        {activeTab === 'create' && (
          <CreateGroupSection
            authUser={authUser}
            groupForm={groupForm}
            setGroupForm={setGroupForm}
            fieldErrors={fieldErrors}
            setFieldErrors={setFieldErrors}
            createGroup={createGroup}
          />
        )}

        {activeTab === 'mygroups' && (
          <MyGroupsSection
            authUser={authUser}
            myGroups={myGroups}
            setSelectedGroup={setSelectedGroup}
            leaveGroup={leaveGroup}
            selectedGroupInfo={selectedGroupInfo}
            groupEditForm={groupEditForm}
            setGroupEditForm={setGroupEditForm}
            updateGroup={updateGroup}
            groupMembers={groupMembers}
            removeMember={removeMember}
          />
        )}

        {activeTab === 'dashboard' && (
          <StudentDashboardSection authUser={authUser} studentOverview={studentOverview} />
        )}

        {activeTab === 'schedule' && (
          <ScheduleSection
            selectedGroup={selectedGroup}
            setSelectedGroup={setSelectedGroup}
            groups={groups}
            fieldErrors={fieldErrors}
            setFieldErrors={setFieldErrors}
            sessionForm={sessionForm}
            setSessionForm={setSessionForm}
            handleCreateSession={handleCreateSession}
            sessions={sessions}
          />
        )}

        {activeTab === 'discussions' && (
          <DiscussionsSection
            selectedGroup={selectedGroup}
            setSelectedGroup={setSelectedGroup}
            groups={groups}
            fieldErrors={fieldErrors}
            setFieldErrors={setFieldErrors}
            selectedGroupInfo={selectedGroupInfo}
            newPost={newPost}
            setNewPost={setNewPost}
            createDiscussion={createDiscussion}
            posts={posts}
            splitComments={splitComments}
            newReplies={newReplies}
            setNewReplies={setNewReplies}
            addReply={addReply}
            newComments={newComments}
            setNewComments={setNewComments}
            addComment={addComment}
            statusMessage={statusMessage}
          />
        )}

        {activeTab === 'admin-dashboard' && (
          <AdminDashboardSection
            authUser={authUser}
            overview={overview}
            adminUsers={adminUsers}
            promoteUser={promoteUser}
            adminGroups={adminGroups}
            deleteGroup={deleteGroup}
          />
        )}

        {activeTab === 'account' && (
          <AccountSection
            authUser={authUser}
            authMode={authMode}
            setAuthMode={setAuthMode}
            authForm={authForm}
            setAuthForm={setAuthForm}
            fieldErrors={fieldErrors}
            handleAuthSubmit={handleAuthSubmit}
            handleLogout={handleLogout}
            statusMessage={statusMessage}
            programOptions={programOptions}
            yearOptions={yearOptions}
            clearFieldError={clearFieldError}
          />
        )}
      </main>
    </div>
  );
}

export default App;
