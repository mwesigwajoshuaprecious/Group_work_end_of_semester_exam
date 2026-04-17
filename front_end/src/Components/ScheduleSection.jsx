function ScheduleSection({
  selectedGroup,
  setSelectedGroup,
  groups,
  fieldErrors,
  setFieldErrors,
  sessionForm,
  setSessionForm,
  handleCreateSession,
  sessions
}) {
  return (
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
  );
}

export default ScheduleSection;
