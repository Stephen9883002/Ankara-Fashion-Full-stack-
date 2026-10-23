import { useState } from 'react';
import { adminFetch } from './adminApi';
import PasswordField from '../components/modals/PasswordField';

function AdminAddAdminForm(props) {
	const [fullName, setFullName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [isSaving, setIsSaving] = useState(false);

	async function handleSubmit(e) {
		e.preventDefault();
		setError('');

		if (!fullName.trim() || !email.trim() || !password) {
			setError('Please fill in every field.');
			return;
		}

		setIsSaving(true);

		try {
			const result = await adminFetch('/admin/admins', {
				method: 'POST',
				body: JSON.stringify({ fullName, email, password }),
			});

			if (!result.ok || !result.data) {
				setError(
					(result.data && result.data.error) || 'Could not create the admin.',
				);
				return;
			}

			props.onCreated(result.data);
		} catch (err) {
			console.error('Add admin error:', err);
			setError('Could not reach the server. Please try again.');
		} finally {
			setIsSaving(false);
		}
	}

	return (
		<div className="admin-modal-overlay">
			<div
				className="admin-modal"
				role="dialog"
				aria-modal="true"
				aria-label="Add new admin"
			>
				<h2>Add New Admin</h2>
				<p className="admin-side-note">
					They will be able to see every order and customer. Share the password
					with them privately.
				</p>

				<form className="admin-edit-form" onSubmit={handleSubmit}>
					<label htmlFor="newAdminName">Full name</label>
					<input
						id="newAdminName"
						type="text"
						autoComplete="off"
						value={fullName}
						onChange={(e) => setFullName(e.target.value)}
					/>

					<label htmlFor="newAdminEmail">Email</label>
					<input
						id="newAdminEmail"
						type="email"
						autoComplete="off"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>

					<label htmlFor="newAdminPassword">Temporary password</label>
					<PasswordField
						id="newAdminPassword"
						placeholder="Temporary password"
						autoComplete="new-password"
						value={password}
						onChange={setPassword}
					/>
					<p className="admin-side-note">
						At least 6 characters. Mix upper and lower case letters, numbers or
						symbols.
					</p>

					{error && (
						<div className="auth-error" role="alert">
							{error}
						</div>
					)}

					<div className="admin-edit-actions">
						<button
							className="admin-small-btn primary"
							type="submit"
							disabled={isSaving}
						>
							{isSaving ? 'Creating...' : 'Create admin'}
						</button>
						<button
							className="admin-small-btn"
							type="button"
							onClick={props.onClose}
						>
							Cancel
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

export default AdminAddAdminForm;
