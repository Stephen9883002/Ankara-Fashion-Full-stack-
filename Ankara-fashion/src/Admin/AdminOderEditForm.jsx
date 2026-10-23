import { useState } from 'react';
import { adminFetch } from './AdminApi';

function AdminOrderEditForm(props) {
	const [fullName, setFullName] = useState(props.order.full_name || '');
	const [phone, setPhone] = useState(props.order.phone || '');
	const [address, setAddress] = useState(props.order.address || '');
	const [note, setNote] = useState('');
	const [error, setError] = useState('');
	const [isSaving, setIsSaving] = useState(false);

	async function handleSubmit(e) {
		e.preventDefault();
		setError('');

		if (!fullName.trim() || !phone.trim() || !address.trim()) {
			setError('Name, phone and address cannot be empty.');
			return;
		}

		setIsSaving(true);

		try {
			const result = await adminFetch('/admin/orders/' + props.order.id, {
				method: 'PATCH',
				body: JSON.stringify({ fullName, phone, address, note }),
			});

			if (!result.ok || !result.data) {
				setError(
					(result.data && result.data.error) || 'Could not save your changes.',
				);
				return;
			}

			props.onSaved();
		} catch (err) {
			console.error('Order edit error:', err);
			setError('Could not reach the server. Please try again.');
		} finally {
			setIsSaving(false);
		}
	}

	return (
		<form className="admin-edit-form" onSubmit={handleSubmit}>
			<label htmlFor="editName">Full name</label>
			<input
				id="editName"
				type="text"
				value={fullName}
				onChange={(e) => setFullName(e.target.value)}
			/>

			<label htmlFor="editPhone">Phone</label>
			<input
				id="editPhone"
				type="tel"
				value={phone}
				onChange={(e) => setPhone(e.target.value)}
			/>

			<label htmlFor="editAddress">Delivery address</label>
			<textarea
				id="editAddress"
				value={address}
				onChange={(e) => setAddress(e.target.value)}
			/>

			<label htmlFor="editNote">Reason for the change (optional)</label>
			<input
				id="editNote"
				type="text"
				maxLength={200}
				placeholder="e.g. Customer called to correct the street"
				value={note}
				onChange={(e) => setNote(e.target.value)}
			/>

			<p className="admin-side-note">
				The email can't be edited because it is tied to the payment.
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
					{isSaving ? 'Saving...' : 'Save changes'}
				</button>
				<button
					className="admin-small-btn"
					type="button"
					onClick={props.onCancel}
				>
					Cancel
				</button>
			</div>
		</form>
	);
}

export default AdminOrderEditForm;
