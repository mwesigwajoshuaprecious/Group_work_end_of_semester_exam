function AccountSection({
  authUser,
  authMode,
  setAuthMode,
  authForm,
  setAuthForm,
  clearFieldError,
  fieldErrors,
  handleAuthSubmit,
  handleLogout,
  statusMessage,
  programOptions,
  yearOptions
}) {
  return (
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
                  clearFieldError('authName');
                }}
              />
              {fieldErrors.authName && <p className="field-error">{fieldErrors.authName}</p>}
              <select
                className="group-select"
                value={authForm.program}
                onChange={(event) => {
                  setAuthForm({ ...authForm, program: event.target.value });
                  clearFieldError('authProgram');
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
                  clearFieldError('authYear');
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
              clearFieldError('authEmail');
            }}
          />
          {fieldErrors.authEmail && <p className="field-error">{fieldErrors.authEmail}</p>}
          <input
            type="password"
            value={authForm.password}
            placeholder="Password"
            onChange={(event) => {
              setAuthForm({ ...authForm, password: event.target.value });
              clearFieldError('authPassword');
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
  );
}

export default AccountSection;
