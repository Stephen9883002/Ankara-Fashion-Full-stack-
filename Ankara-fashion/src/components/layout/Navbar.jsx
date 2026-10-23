import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './brand-navbar.css';

function Navbar(props) {
	const [inputValue, setInputValue] = useState('');
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const cartCount = props.cartItems
		? props.cartItems.reduce((total, item) => total + item.qty, 0)
		: 0;
	const navWrapperRef = useRef(null);
	const navigate = useNavigate();

	useEffect(() => {
		function handleOutsideClick(e) {
			if (
				isMenuOpen &&
				navWrapperRef.current &&
				!navWrapperRef.current.contains(e.target)
			) {
				setIsMenuOpen(false);
			}
		}
		document.addEventListener('mousedown', handleOutsideClick);
		return () => {
			document.removeEventListener('mousedown', handleOutsideClick);
		};
	}, [isMenuOpen]);

	return (
		<header className="ankara-brand-header">
			<div className="ankara-nav-container">
				{/* Top Row Header Layout Frame */}
				<div className="ankara-main-nav-row">
					{/* Hamburger Toggle Action Button */}
					<button
						className="ankara-mobile-hamburger-trigger"
						type="button"
						aria-label="Open menu"
						onClick={(e) => {
							e.stopPropagation();
							setIsMenuOpen(true);
						}}
					>
						<span className="material-icons-sharp">menu</span>
					</button>

					{/* Brand Image Identity Frame */}
					<div className="ankara-logo-frame">
						<a href="#hero">
							<img src="/img/ANK-LOGO.PNG" alt="Ankara Fashion Logo" />
						</a>
					</div>

					{/* Center Row Content: Desktop Text Links */}
					<nav
						className="ankara-desktop-nav-links"
						aria-label="Main navigation"
					>
						<a href="#new">New</a>
						<a href="#categories">Categories</a>
						<a href="#best-sellers">Best Sellers</a>
						<a href="#about">About</a>
						<a href="#contact">Contact</a>
					</nav>

					{/* Desktop Search Integration */}
					<div className="ankara-search-wrapper desktop-search-only">
						<input
							type="text"
							className="ankara-search-input"
							placeholder="Search for unique fabrics..."
							aria-label="Search products"
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter') props.onSearch(inputValue);
							}}
						/>
						<button
							className="ankara-search-action-btn"
							type="button"
							aria-label="Execute Search"
							onClick={() => props.onSearch(inputValue)}
						>
							<span className="material-icons-sharp">search</span>
						</button>
					</div>

					{/* Right Side Control Interface Cluster (Hidden automatically on Mobile) */}
					<div className="ankara-action-cluster desktop-actions-only">
						{props.currentUser && (
							<span className="ankara-account-greeting-span">
								Hi, {props.currentUser.fullName?.split(' ')[0] || 'there'}
							</span>
						)}

						{props.currentUser ? (
							<button
								className="ankara-account-profile-btn"
								type="button"
								onClick={() => navigate('/account')}
							>
								<span className="material-icons-sharp">person</span>
								user
							</button>
						) : (
							<div
								style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
							>
								<button
									className="ankara-account-profile-btn"
									style={{ backgroundColor: '#2c323d' }}
									type="button"
									onClick={props.onOpenTrackOrder}
								>
									<span className="material-icons-sharp">local_shipping</span>
									Track
								</button>
								<button
									className="ankara-account-profile-btn"
									type="button"
									onClick={() => props.onSetAuthView('signup')}
								>
									<span className="material-icons-sharp">person_add</span>
									Join
								</button>
							</div>
						)}

						<button
							className="ankara-premium-cart-btn"
							type="button"
							aria-label="Open Shopping Bag"
							onClick={props.onToggleCart}
						>
							<span className="material-icons-sharp">shopping_cart</span>
							<span className="cart-btn-label">Cart</span>
							<span className="ankara-cart-numeric-badge">{cartCount}</span>
						</button>
					</div>

					{/* Dedicated Simple Mobile Cart Trigger Icon to keep things tidy */}
					<button
						className="ankara-mobile-cart-shortcut-trigger"
						type="button"
						aria-label="Open Cart"
						onClick={props.onToggleCart}
					>
						<span className="material-icons-sharp">shopping_cart</span>
						<span className="ankara-cart-numeric-badge">{cartCount}</span>
					</button>
				</div>

				{/* Modular Mobile Input Search Row (Visible only on mobile screen layouts) */}
				<div className="ankara-search-wrapper mobile-search-only">
					<input
						type="text"
						className="ankara-search-input"
						placeholder="Search unique fabrics..."
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter') props.onSearch(inputValue);
						}}
					/>
					<button
						className="ankara-search-action-btn"
						type="button"
						onClick={() => props.onSearch(inputValue)}
					>
						<span className="material-icons-sharp">search</span>
					</button>
				</div>

				{/* --- Touch Sidebar Drawer Canvas Overlay Element --- */}
				<div
					ref={navWrapperRef}
					className={`ankara-mobile-sidebar-drawer ${isMenuOpen ? 'is-drawer-open' : ''}`}
				>
					<div className="ankara-drawer-dismiss-row">
						<button
							className="ankara-drawer-dismiss-btn"
							type="button"
							onClick={() => setIsMenuOpen(false)}
						>
							<span className="material-icons-sharp">close</span>
						</button>
					</div>

					<nav
						className="ankara-drawer-links-stack"
						aria-label="Mobile Navigation List"
					>
						<a href="#new" onClick={() => setIsMenuOpen(false)}>
							New
						</a>
						<a href="#categories" onClick={() => setIsMenuOpen(false)}>
							Categories
						</a>
						<a href="#best-sellers" onClick={() => setIsMenuOpen(false)}>
							Best Sellers
						</a>
						<a href="#about" onClick={() => setIsMenuOpen(false)}>
							About Us
						</a>
						<a href="#contact" onClick={() => setIsMenuOpen(false)}>
							Contact Us
						</a>
					</nav>

					<div className="ankara-drawer-auth-footprint">
						{props.currentUser ? (
							<>
								<span className="ankara-drawer-user-greeting">
									Hi, {props.currentUser.fullName || 'User'}
								</span>
								<button
									className="ankara-account-profile-btn"
									type="button"
									onClick={() => {
										setIsMenuOpen(false);
										navigate('/account');
									}}
								>
									<span className="material-icons-sharp">account_circle</span>
									My Account
								</button>
							</>
						) : (
							<>
								<button
									className="ankara-account-profile-btn"
									style={{ backgroundColor: '#2c323d' }}
									type="button"
									onClick={() => {
										setIsMenuOpen(false);
										props.onOpenTrackOrder();
									}}
								>
									<span className="material-icons-sharp">local_shipping</span>
									Track Order
								</button>
								<button
									className="ankara-account-profile-btn"
									type="button"
									onClick={() => {
										setIsMenuOpen(false);
										props.onSetAuthView('signup');
									}}
								>
									<span className="material-icons-sharp">person_add</span>
									Create Account
								</button>
							</>
						)}
					</div>
				</div>
			</div>
		</header>
	);
}

export default Navbar;
