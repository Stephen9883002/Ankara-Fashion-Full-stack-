import { API_URL } from '../../config';
import { useState } from 'react';
import PasswordField from '../modals/PasswordField';
import {
	MIN_PASSWORD_LENGTH,
	getPasswordStrength,
} from '../../utills/passwordStrength';

function AccountSettings(props) {
	const [fullName, setFullName] = useState(
		props.currentUser ? props.currentUser.fullName : '',
	);
	const [email, setEmail] = useState(
		props.currentUser ? props.currentUser.email : '',
	);
	const [emailPassword, setEmailPassword] = useState('');
	const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
	const [isSavingProfile, setIsSavingProfile] = useState(false);

	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [passwordMessage, setPasswordMessage] = useState({
		type: '',
		text: '',
	});
	const [isSavingPassword, setIsSavingPassword] = useState(false);

	const strength = getPasswordStrength(newPassword);
	const emailChanged =
		props.currentUser &&
		email.trim().toLowerCase() !== props.currentUser.email.toLowerCase();

	async function handleSaveProfile(e) {
		e.preventDefault();
		setProfileMessage({ type: '', text: '' });

		if (!fullName.trim() || !email.trim()) {
			setProfileMessage({
				type: 'error',
				text: 'Name and email cannot be empty.',
			});
			return;
		}

		if (emailChanged && !emailPassword) {
			setProfileMessage({
				type: 'error',
				text: 'Enter your current password to change your email.',
			});
			return;
		}

		setIsSavingProfile(true);

		try {
			const response = await fetch(`${API_URL}/me`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${props.authToken}`,
				},
				body: JSON.stringify({
					fullName,
					email,
					currentPassword: emailPassword,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				setProfileMessage({
					type: 'error',
					text: data.error || 'Could not save your changes.',
				});
				return;
			}

			props.onProfileUpdated(data);
			setFullName(data.fullName);
			setEmail(data.email);
			setEmailPassword('');
			setProfileMessage({
				type: 'success',
				text: 'Your details were updated.',
			});
		} catch (error) {
			console.error('Profile update error:', error);
			setProfileMessage({
				type: 'error',
				text: 'Could not reach the server. Please try again.',
			});
		} finally {
			setIsSavingProfile(false);
		}
	}

	async function handleChangePassword(e) {
		e.preventDefault();
		setPasswordMessage({ type: '', text: '' });

		if (!currentPassword || !newPassword || !confirmPassword) {
			setPasswordMessage({
				type: 'error',
				text: 'Please fill in every password field.',
			});
			return;
		}

		if (newPassword.length < MIN_PASSWORD_LENGTH) {
			setPasswordMessage({
				type: 'error',
				text: `New password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
			});
			return;
		}

		if (strength.level < 3) {
			setPasswordMessage({
				type: 'error',
				text: 'Please choose a stronger password. Mix upper and lower case letters, numbers or symbols.',
			});
			return;
		}

		if (newPassword !== confirmPassword) {
			setPasswordMessage({
				type: 'error',
				text: 'New passwords do not match.',
			});
			return;
		}

		setIsSavingPassword(true);

		try {
			const response = await fetch(`${API_URL}/me/password`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${props.authToken}`,
				},
				body: JSON.stringify({ currentPassword, newPassword }),
			});

			const data = await response.json();

			if (!response.ok) {
				setPasswordMessage({
					type: 'error',
					text: data.error || 'Could not update your password.',
				});
				return;
			}

			setCurrentPassword('');
			setNewPassword('');
			setConfirmPassword('');
			setPasswordMessage({ type: 'success', text: 'Password updated.' });
		} catch (error) {
			console.error('Password update error:', error);
			setPasswordMessage({
				type: 'error',
				text: 'Could not reach the server. Please try again.',
			});
		} finally {
			setIsSavingPassword(false);
		}
	}

	if (!props.currentUser) return <p>Please log in to manage your account.</p>;

	return (
		<div>
			<form className="account-settings-card" onSubmit={handleSaveProfile}>
				<h3>Profile</h3>

				<div className="account-settings-field">
					<label htmlFor="settingsName">Full Name</label>
					<input
						type="text"
						id="settingsName"
						value={fullName}
						onChange={(e) => setFullName(e.target.value)}
					/>
				</div>

				<div className="account-settings-field">
					<label htmlFor="settingsEmail">Email</label>
					<input
						type="email"
						id="settingsEmail"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
				</div>

				{emailChanged && (
					<div className="account-settings-field">
						<label htmlFor="settingsEmailPassword">
							Current password (needed to change your email)
						</label>
						<PasswordField
							id="settingsEmailPassword"
							placeholder="Current password"
							autoComplete="current-password"
							value={emailPassword}
							onChange={setEmailPassword}
						/>
					</div>
				)}

				{profileMessage.text && (
					<p className={'settings-message ' + profileMessage.type}>
						{profileMessage.text}
					</p>
				)}

				<button
					className="account-save-btn"
					type="submit"
					disabled={isSavingProfile}
				>
					{isSavingProfile ? 'Saving...' : 'Save Changes'}
				</button>
			</form>

			<form className="account-settings-card" onSubmit={handleChangePassword}>
				<h3>Change Password</h3>

				<div className="account-settings-field">
					<label htmlFor="settingsCurrentPassword">Current Password</label>
					<PasswordField
						id="settingsCurrentPassword"
						placeholder="Current password"
						autoComplete="current-password"
						value={currentPassword}
						onChange={setCurrentPassword}
					/>
				</div>

				<div className="account-settings-field">
					<label htmlFor="settingsNewPassword">New Password</label>
					<PasswordField
						id="settingsNewPassword"
						placeholder="New password"
						autoComplete="new-password"
						value={newPassword}
						onChange={setNewPassword}
					/>

					{newPassword && (
						<div className="password-strength">
							<div className="strength-bar">
								{[1, 2, 3, 4].map((segment) => (
									<span
										key={segment}
										className={
											'strength-segment ' +
											(strength.level >= segment
												? 'level-' + strength.level
												: '')
										}
									></span>
								))}
							</div>
							<small className="strength-label">{strength.label}</small>
						</div>
					)}

					<small className="password-hint">
						Use at least {MIN_PASSWORD_LENGTH} characters and reach at least
						Medium strength.
					</small>
				</div>

				<div className="account-settings-field">
					<label htmlFor="settingsConfirmPassword">Confirm New Password</label>
					<PasswordField
						id="settingsConfirmPassword"
						placeholder="Confirm new password"
						autoComplete="new-password"
						value={confirmPassword}
						onChange={setConfirmPassword}
					/>

					{confirmPassword && confirmPassword !== newPassword && (
						<small className="field-error">Passwords do not match.</small>
					)}
				</div>

				{passwordMessage.text && (
					<p className={'settings-message ' + passwordMessage.type}>
						{passwordMessage.text}
					</p>
				)}

				<button
					className="account-save-btn"
					type="submit"
					disabled={isSavingPassword}
				>
					{isSavingPassword ? 'Updating...' : 'Update Password'}
				</button>
			</form>
		</div>
	);
}

export default AccountSettings;
