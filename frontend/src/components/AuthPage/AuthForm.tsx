import React from 'react';
import type { AuthFormData } from '../../../../shared/types/auth';

interface AuthFormProps {
  mode: 'signin' | 'signup';
  onSubmit: (data: AuthFormData) => void | Promise<void>;
  loading: boolean;
  error: string | null;
}

const AuthForm: React.FC<AuthFormProps> = ({ mode, onSubmit, loading, error }) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [displayName, setDisplayName] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: AuthFormData = { email, password, displayName: displayName || undefined };
    void onSubmit(data);
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} aria-live="polite">
      {error && <div role="alert" className="auth-error">{error}</div>}

      {mode === 'signup' && (
        <div className="form-group">
          <label htmlFor="displayName">Display name</label>
          <input id="displayName" value={displayName} onChange={e => setDisplayName(e.target.value)} />
        </div>
      )}

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      </div>

      <div className="form-actions">
        <button type="submit" disabled={loading} className="submit-button">
          {loading ? 'Please wait...' : (mode === 'signin' ? 'Sign In' : 'Sign Up')}
        </button>
      </div>
    </form>
  );
};

export default AuthForm;
