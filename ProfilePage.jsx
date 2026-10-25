import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, LogOut, CheckCircle, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from '../components/ErrorMessage';

export default function ProfilePage() {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const navigate = useNavigate();

  // Profile Name Form State
  const [name, setName] = useState(user?.name || '');
  const [nameSuccess, setNameSuccess] = useState(null);
  const [nameError, setNameError] = useState(null);
  const [savingName, setSavingName] = useState(false);

  // Password Change Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [pwdSuccess, setPwdSuccess] = useState(null);
  const [pwdError, setPwdError] = useState(null);
  const [changingPwd, setChangingPwd] = useState(false);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    setNameError(null);
    setNameSuccess(null);

    if (!name.trim()) {
      setNameError('Name cannot be empty.');
      return;
    }

    try {
      setSavingName(true);
      await updateProfile(name.trim());
      setNameSuccess('Profile name updated successfully!');
      setTimeout(() => setNameSuccess(null), 3000);
    } catch (err) {
      setNameError(err.response?.data?.message || err.message || 'Failed to update name.');
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(null);

    if (!passwordData.currentPassword) {
      setPwdError('Please enter your current password.');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPwdError('New password must be at least 6 characters long.');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setPwdError('New passwords do not match.');
      return;
    }

    try {
      setChangingPwd(true);
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPwdSuccess('Your password has been changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      setTimeout(() => setPwdSuccess(null), 3000);
    } catch (err) {
      setPwdError(err.response?.data?.message || err.message || 'Failed to change password.');
    } finally {
      setChangingPwd(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem', maxWidth: '750px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Account Profile
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Manage your personal credentials and security settings
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="btn btn-danger btn-sm"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Basic Info Card */}
        <div
          style={{
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            padding: '2rem',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={20} style={{ color: 'var(--primary)' }} />
            Personal Details
          </h2>

          {nameSuccess && (
            <div className="alert alert-success">
              <CheckCircle size={18} />
              <span>{nameSuccess}</span>
            </div>
          )}
          {nameError && <ErrorMessage message={nameError} />}

          <form onSubmit={handleUpdateName}>
            <div className="form-group">
              <label className="form-label" htmlFor="email-static">
                Email Address
              </label>
              <input
                type="text"
                id="email-static"
                value={user?.email || ''}
                readOnly
                className="form-input"
                style={{ background: '#f8fafc', color: 'var(--text-muted)', cursor: 'not-allowed' }}
              />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Email address is tied to your primary authentication and cannot be changed.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-name">
                Full Name
              </label>
              <input
                type="text"
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                disabled={savingName}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={savingName || name.trim() === user?.name}
            >
              {savingName ? 'Saving Changes...' : 'Save Profile Name'}
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div
          style={{
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            padding: '2rem',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={20} style={{ color: 'var(--primary)' }} />
            Change Password
          </h2>

          {pwdSuccess && (
            <div className="alert alert-success">
              <CheckCircle size={18} />
              <span>{pwdSuccess}</span>
            </div>
          )}
          {pwdError && <ErrorMessage message={pwdError} />}

          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label className="form-label" htmlFor="currentPassword">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                placeholder="Enter current password"
                className="form-input"
                disabled={changingPwd}
                autoComplete="current-password"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="newPassword">
                  New Password (min. 6 characters)
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Enter new password"
                  className="form-input"
                  disabled={changingPwd}
                  autoComplete="new-password"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirmNewPassword">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmNewPassword"
                  value={passwordData.confirmNewPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })}
                  placeholder="Repeat new password"
                  className="form-input"
                  disabled={changingPwd}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-secondary"
              disabled={changingPwd || !passwordData.currentPassword || !passwordData.newPassword}
            >
              {changingPwd ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
