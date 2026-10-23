function AccountSidebar(props) {
	return (
		<div className="account-sidebar">
			<div className="account-sidebar-header">
				<h3>{props.currentUser ? props.currentUser.fullName : 'Guest'}</h3>
				<p>{props.currentUser ? props.currentUser.email : ''}</p>
			</div>

			<button
				className={`account-nav-item ${props.activeSection === 'orders' ? 'active' : ''}`}
				type="button"
				onClick={() => props.onSectionChange('orders')}
			>
				<span className="material-icons-sharp">shopping_bag</span>
				My Orders
			</button>
			<button
				className={`account-nav-item ${props.activeSection === 'settings' ? 'active' : ''}`}
				type="button"
				onClick={() => props.onSectionChange('settings')}
			>
				<span className="material-icons-sharp">settings</span>
				Account Settings
			</button>

			<button
				className="account-nav-item logout"
				type="button"
				onClick={props.onLogout}
			>
				<span className="material-icons-sharp">logout</span>
				Log Out
			</button>
		</div>
	);
}

export default AccountSidebar;
