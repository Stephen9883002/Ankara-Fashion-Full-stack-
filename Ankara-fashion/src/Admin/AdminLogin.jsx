import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import PasswordField from '../components/modals/PasswordField';
import { saveAdminSession } from './adminSession';

function AdminLogin() {
	const navigate = useNavigate();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function handleSubmit(e) {
		e.preventDefault();
		setError('');

		if (!email.trim() || !password) {
			setError('Please enter your email and password.');
			return;
		}

		setIsSubmitting(true);

		try {
			const response = await fetch(`${API_URL}/admin/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: email.trim(), password }),
			});

			const data = await response.json();

			if (!response.ok) {
				setError(data.error || 'Something went wrong. Please try again.');
				return;
			}

			saveAdminSession(data.user, data.token);
			navigate('/admin', { replace: true });
		} catch (err) {
			console.error('Admin login error:', err);
			setError('Could not reach the server. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<div className="admin-login-page">
			<form className="admin-login-card" onSubmit={handleSubmit}>
				<h1>Ankara Fashion</h1>
				<p className="admin-login-subtitle">Admin sign in</p>

				{error && (
					<div className="auth-error" role="alert">
						{error}
					</div>
				)}

				<input
					type="email"
					placeholder="Email Address"
					aria-label="Email Address"
					autoComplete="username"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
				/>

				<PasswordField
					id="adminPassword"
					placeholder="Password"
					autoComplete="current-password"
					value={password}
					onChange={setPassword}
					required
				/>

				<button
					className="admin-primary-btn"
					type="submit"
					disabled={isSubmitting}
				>
					{isSubmitting ? 'Signing in...' : 'Sign In'}
				</button>
			</form>
		</div>
	);
}

export default AdminLogin;
