import './auth-modal.css';
import { useState } from 'react';
import PasswordField from './PasswordField';
import {
	MIN_PASSWORD_LENGTH,
	getPasswordStrength,
} from '../../utills/passwordStrength';

function AuthModal(props) {
	const [signupName, setSignupName] = useState('');
	const [signupEmail, setSignupEmail] = useState('');
	const [signupPassword, setSignupPassword] = useState('');
	const [signupConfirm, setSignupConfirm] = useState('');
	const [loginEmail, setLoginEmail] = useState('');
	const [loginPassword, setLoginPassword] = useState('');
	const [rememberMe, setRememberMe] = useState(false);
	const [authError, setAuthError] = useState('');
	const [authNotice, setAuthNotice] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const strength = getPasswordStrength(signupPassword);

	function resetForms() {
		setSignupName('');
		setSignupEmail('');
		setSignupPassword('');
		setSignupConfirm('');
		setLoginEmail('');
		setLoginPassword('');
		setAuthError('');
		setAuthNotice('');
	}

	function closeModal() {
		resetForms();
		props.onSetAuthView(null);
	}

	function switchView(view) {
		setAuthError('');
		setAuthNotice('');
		props.onSetAuthView(view);
	}

	async function handleSignup(e) {
		e.preventDefault();
		setAuthError('');

		const fullName = signupName.trim();
		const email = signupEmail.trim().toLowerCase();

		if (!fullName || !email || !signupPassword || !signupConfirm) {
			setAuthError('Please fill in every field.');
			return;
		}

		if (signupPassword.length < MIN_PASSWORD_LENGTH) {
			setAuthError(
				`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
			);
			return;
		}

		if (strength.level < 3) {
			setAuthError(
				'Please choose a stronger password. Mix upper and lower case letters, numbers or symbols.',
			);
			return;
		}

		if (signupPassword !== signupConfirm) {
			setAuthError('Passwords do not match.');
			return;
		}

		setIsSubmitting(true);

		try {
			const response = await fetch('http://localhost:3000/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ fullName, email, password: signupPassword }),
			});

			const data = await response.json();

			if (!response.ok) {
				setAuthError(data.error || 'Something went wrong. Please try again.');
				return;
			}

			setLoginEmail(email);
			setSignupName('');
			setSignupEmail('');
			setSignupPassword('');
			setSignupConfirm('');
			setAuthNotice('Account created! Please log in.');
			props.onSetAuthView('login');
		} catch (error) {
			console.error('Signup error:', error);
			setAuthError('Could not reach the server. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleLogin(e) {
		e.preventDefault();
		setAuthError('');
		setAuthNotice('');

		const email = loginEmail.trim().toLowerCase();

		if (!email || !loginPassword) {
			setAuthError('Please enter both email and password.');
			return;
		}

		setIsSubmitting(true);

		try {
			const response = await fetch('http://localhost:3000/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password: loginPassword, rememberMe }),
			});

			const data = await response.json();

			if (!response.ok) {
				setAuthError(data.error || 'Invalid email or password.');
				return;
			}

			props.onLoginSuccess(data.user, data.token, rememberMe);
			closeModal();
		} catch (error) {
			console.error('Login error:', error);
			setAuthError('Could not reach the server. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<div
			id="authModal"
			className="ankara-auth-overlay-backdrop"
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				width: '100vw',
				height: '100vh',
				backgroundColor: 'rgba(0, 0, 0, 0.65)',
				backdropFilter: 'blur(4px)',
				display: props.authView ? 'flex' : 'none',
				alignItems: 'center',
				justifyContent: 'center',
				padding: '1.5rem',
				overflowY: 'auto',
				zIndex: 9999999999,
				pointerEvents: 'auto',
			}}
			onClick={(e) => {
				if (e.target === e.currentTarget) closeModal();
			}}
		>
			<div
				className="ankara-auth-modal-card"
				style={{
					background: '#ffffff',
					borderRadius: '16px',
					width: '100%',
					maxWidth: '480px',
					boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
					overflow: 'visible',
					position: 'relative',
					margin: 'auto',
					display: 'block',
					height: 'auto',
				}}
			>
				{/* FIXED CLOSE ACTION ROW LAYER */}
				<div
					className="ankara-auth-dismiss-row"
					style={{
						display: 'flex',
						justifyContent: 'flex-end',
						padding: '1.25rem 1.5rem 0 1.5rem',
					}}
				>
					<button
						className="ankara-auth-close-trigger"
						type="button"
						id="authCloseBtn"
						aria-label="Close authentication window"
						style={{
							background: '#f3f4f6',
							border: 'none',
							color: '#4b5563',
							fontSize: '1.5rem',
							width: '32px',
							height: '32px',
							borderRadius: '50%',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							cursor: 'pointer',
							zIndex: 99,
						}}
						onClick={(e) => {
							e.stopPropagation(); /* Prevents click event leakage bubbles */
							closeModal();
						}}
					>
						&times;
					</button>
				</div>

				{/* System Operational Alert Status Badges Banner */}
				{authError && (
					<div className="ankara-auth-global-error-panel" role="alert">
						{authError}
					</div>
				)}
				{authNotice && (
					<div className="ankara-auth-global-notice-panel">{authNotice}</div>
				)}

				{/* PANEL 1: SIGN-UP ACCOUNT CREATION FORM MANIFEST */}
				<div
					className="ankara-auth-form-panel"
					id="signupForm"
					style={{
						display: props.authView !== 'login' ? 'block' : 'none',
					}}
				>
					<h2>Create Your Account</h2>
					<p>Join Ankara Fashion today</p>

					<form
						className="ankara-auth-form-group"
						id="signupFormElement"
						onSubmit={handleSignup}
					>
						<input
							type="text"
							id="signupName"
							placeholder="Full Name"
							aria-label="Full Name"
							autoComplete="name"
							value={signupName}
							onChange={(e) => setSignupName(e.target.value)}
							required
						/>
						<input
							type="email"
							id="signupEmail"
							placeholder="Email Address"
							aria-label="Email Address"
							autoComplete="email"
							value={signupEmail}
							onChange={(e) => setSignupEmail(e.target.value)}
							required
						/>

						<PasswordField
							id="signupPassword"
							placeholder="Password"
							autoComplete="new-password"
							value={signupPassword}
							onChange={setSignupPassword}
						/>

						{signupPassword && (
							<div
								className="ankara-password-meter-box"
								style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}
							>
								<div
									className="ankara-meter-bar-track"
									style={{ display: 'flex', gap: '0.35rem', width: '100%' }}
								>
									{[1, 2, 3, 4, 5].map((segment) => (
										<span
											key={segment}
											className={`ankara-meter-segment-block ${
												strength.level >= segment
													? 'level-' + strength.level
													: ''
											}`}
										></span>
									))}
								</div>
								<small
									className="ankara-meter-label-caption"
									style={{
										display: 'block',
										marginTop: '0.25rem',
										fontWeight: 600,
									}}
								>
									{strength.label}
								</small>
							</div>
						)}

						<small className="ankara-auth-hint-text">
							Use at least {MIN_PASSWORD_LENGTH} characters, not 123456 😂.
						</small>

						<PasswordField
							id="signupConfirmPassword"
							placeholder="Confirm Password"
							autoComplete="new-password"
							value={signupConfirm}
							onChange={setSignupConfirm}
						/>

						{signupConfirm && signupConfirm !== signupPassword && (
							<small className="ankara-auth-field-error-alert">
								Passwords do not match.
							</small>
						)}

						<button
							type="submit"
							className="ankara-auth-submit-btn"
							id="createAccountBtn"
							disabled={isSubmitting}
						>
							{isSubmitting ? 'Creating account...' : 'Create Account'}
						</button>
					</form>

					<p className="ankara-auth-footer-toggle-prompt">
						Already have an account?{' '}
						<button
							type="button"
							className="ankara-auth-inline-link-btn"
							id="showLoginBtn"
							onClick={() => switchView('login')}
						>
							Log In
						</button>
					</p>
				</div>

				{/* PANEL 2: RETURNING USERS SIGN-IN LOGIN VIEW */}
				<div
					className="ankara-auth-form-panel"
					id="loginForm"
					style={{
						display: props.authView === 'login' ? 'block' : 'none',
					}}
				>
					<h2>Welcome Back</h2>
					<p>Sign in to your account</p>

					<form
						className="ankara-auth-form-group"
						id="loginFormElement"
						onSubmit={handleLogin}
					>
						<input
							type="email"
							id="loginEmail"
							placeholder="Email Address"
							aria-label="Email Address"
							autoComplete="email"
							value={loginEmail}
							onChange={(e) => setLoginEmail(e.target.value)}
							required
						/>

						<PasswordField
							id="loginPassword"
							placeholder="Password"
							autoComplete="current-password"
							value={loginPassword}
							/* FIXED THE TYPO HERE: Correctly updates login state variable values */
							onChange={setLoginPassword}
						/>

						<div className="ankara-auth-utility-row">
							<label className="ankara-auth-checkbox-label">
								<input
									type="checkbox"
									checked={rememberMe}
									onChange={(e) => setRememberMe(e.target.checked)}
								/>
								<span>Remember me</span>
							</label>
						</div>

						<button
							type="submit"
							className="ankara-auth-submit-btn"
							id="signInBtn"
							disabled={isSubmitting}
						>
							{isSubmitting ? 'Signing in...' : 'Sign In'}
						</button>
					</form>

					<p className="ankara-auth-footer-toggle-prompt">
						Don't have an account?{' '}
						<button
							type="button"
							className="ankara-auth-inline-link-btn"
							id="showSignupBtn"
							onClick={() => switchView('signup')}
						>
							Sign Up
						</button>
					</p>
				</div>
			</div>
		</div>
	);
}

export default AuthModal;
