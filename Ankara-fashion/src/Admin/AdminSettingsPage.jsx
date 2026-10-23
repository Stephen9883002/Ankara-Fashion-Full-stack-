import { useOutletContext } from 'react-router-dom';

import AccountSettings from '../components/pages/AccountSettings';
import { getAdminToken } from './adminSession';

function AdminSettingsPage() {
	const { admin, onAdminUpdated } = useOutletContext();

	return (
		<div>
			<h1 className="admin-page-title">Settings</h1>
			<p className="admin-page-subtitle">
				Update Ypur Admin Profile And Password
			</p>
			<div className="admin-settings-wrap">
				<AccountSettings
					currentUser={admin}
					authToken={getAdminToken}
					onProfileUpdated={onAdminUpdated}
				/>
			</div>
		</div>
	);
}
export default AdminSettingsPage;
