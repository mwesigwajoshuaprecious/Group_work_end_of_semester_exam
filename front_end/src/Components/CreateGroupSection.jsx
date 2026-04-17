function CreateGroupSection({
  authUser,
  groupForm,
  setGroupForm,
  fieldErrors,
  setFieldErrors,
  createGroup
}) {
  return (
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
  );
}

export default CreateGroupSection;
