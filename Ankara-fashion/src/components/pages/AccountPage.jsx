import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AccountSidebar from './AccountSidebar';
import AccountOrders from './AccountOrders';
import AccountSettings from './AccountSettings';

function AccountPage(props) {
	const navigate = useNavigate();
	const [activeSection, setActiveSection] = useState('orders');

	function handleLogoutClick() {
		props.onLogout();
		navigate('/');
	}

	return (
		<div className="account-page">
			<AccountSidebar
				currentUser={props.currentUser}
				activeSection={activeSection}
				onSectionChange={setActiveSection}
				onLogout={handleLogoutClick}
			/>
			<div className="account-content">
				<div className="account-topbar">
					<h1>
						{activeSection === 'orders' ? 'My Orders' : 'Account Settings'}
					</h1>
					<button
						className="continue-shopping-btn"
						type="button"
						onClick={() => navigate('/')}
					>
						Continue Shopping
						<span class="material-icons-sharp">shopping_cart_checkout</span>
					</button>
				</div>

				{activeSection === 'orders' && (
					<AccountOrders authToken={props.authToken} />
				)}
				{activeSection === 'settings' && (
					<AccountSettings
						currentUser={props.currentUser}
						authToken={props.authToken}
						onProfileUpdated={props.onProfileUpdated}
					/>
				)}
			</div>
		</div>
	);
}

export default AccountPage;
