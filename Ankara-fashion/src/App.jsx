import { useState, useEffect } from 'react';
import './App.css';
import './Admin/Admin.css';
import Navbar from './components/layout/Navbar.jsx';
import Hero from './components/sections/Hero.jsx';
import Categories from './components/sections/Categories.jsx';
import Featured from './components/sections/Featured.jsx';
import BestSeller from './components/sections/BestSeller.jsx';
import Gallery from './components/sections/Gallery.jsx';
import NewArrival from './components/sections/NewArrival.jsx';
import AboutBrand from './components/sections/AboutBrand.jsx';
import TrustSection from './components/sections/TrustSection.jsx';
import WhyUs from './components/sections/WhyUs.jsx';
import CategoryProducts from './components/sections/CategoryProducts.jsx';
import Footer from './components/layout/Footer.jsx';
import CardPanel from './components/modals/CardPanel.jsx';
import CheckoutModal from './components/modals/CheckoutModal.jsx';
import AuthModal from './components/modals/AuthModal.jsx';
import product from './data/product.js';
import OrderComfirmation from './components/modals/OrderComfirmation.jsx';
import TrackOrderModal from './components/modals/TrackOrderModal.jsx';
import MyOrdersModal from './components/modals/MyOrders.jsx';
import { Routes, Route } from 'react-router-dom';
import AccountPage from './components/pages/AccountPage.jsx';
import AdminLogin from './Admin/AdminLogin.jsx';
import AdminRoute from './Admin/AdminRoute.jsx';
import AdminLayout from './Admin/AdminLayout.jsx';
import AdminPlaceholder from './Admin/AdminPlaceholder.jsx';
import { Navigate } from 'react-router-dom';
import AdminOrdersPage from './Admin/AdminOrdersPage.jsx';
import AdminOrderDetailPage from './Admin/AdminOrderDetailsPage.jsx';
import AdminUsersPage from './Admin/AdminUsersPage.jsx';
import AdminAnalyticsPage from './Admin/AdminAnalyticsPage.jsx';
import AdminSettingsPage from './Admin/AdminSettingsPage.jsx';
import { API_URL } from './config';

function readSavedSession(key) {
	return localStorage.getItem(key) || sessionStorage.getItem(key);
}
function App() {
	const [activeCategory, setActiveCategory] = useState('');
	const [scrollSignal, setScrollSignal] = useState(0);
	const [searchTerm, setSearchTerm] = useState('');
	const [scrollTarget, setScrollTarget] = useState(null);
	const [cartItems, setCartItems] = useState([]);
	const [isCartOpen, setIsCartOpen] = useState(false);
	const [completedOrder, setCompletedOrder] = useState(null);
	const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
	const cartTotal = cartItems.reduce(
		(total, item) => total + item.numericPrice * item.qty,
		0,
	);
	const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
	const [checkoutItems, setCheckoutItems] = useState([]);
	const [authView, setAuthView] = useState(null);
	// Backend start Here
	const [serverProducts, setServerProducts] = useState([]);
	const [checkoutFromCart, setCheckoutFromCart] = useState(true);
	const [currentUser, setCurrentUser] = useState(() => {
		try {
			const saved = readSavedSession('ankaraUser');
			return saved ? JSON.parse(saved) : null;
		} catch {
			return null;
		}
	});
	const [authToken, setAuthToken] = useState(() =>
		readSavedSession('ankaraToken'),
	);
	const [isMyOrdersOpen, setIsMyOrdersOpen] = useState(false);

	function clearSavedSession() {
		localStorage.removeItem('ankaraUser');
		localStorage.removeItem('ankaraToken');
		sessionStorage.removeItem('ankaraUser');
		sessionStorage.removeItem('ankaraToke');
	}

	function handleProfileUpdated(user) {
		const storage = localStorage.getItem('ankaraUser')
			? localStorage
			: sessionStorage;
		storage.setItem('ankaraUser', JSON.stringify(user));
		setCurrentUser(user);
	}

	function handleLoginSuccess(user, token, rememberMe) {
		clearSavedSession();

		const storage = rememberMe ? localStorage : sessionStorage;
		storage.setItem('ankaraUser', JSON.stringify(user));
		storage.setItem('ankaraToken', token);
		setCurrentUser(user);
		setAuthToken(token);
	}

	function handleLogout() {
		clearSavedSession();
		setCurrentUser(null);
		setAuthToken(null);
	}

	function openCheckoutFromCart() {
		if (cartItems.length === 0) {
			alert('Your cart is Empty');
			return;
		}
		setCheckoutItems(cartItems);
		setCheckoutFromCart(false);
		setIsCheckoutOpen(true);
	}
	function closeCheckout() {
		setIsCheckoutOpen(false);
	}
	function openCheckoutWithItem(product) {
		const numericPrice = product.price;
		setCheckoutItems([{ ...product, qty: 1, numericPrice }]);
		setIsCheckoutOpen(true);
	}

	function clearCart() {
		setCartItems([]);
	}

	function toggleCart() {
		setIsCartOpen((prev) => !prev);
	}
	function addToCart(newItem) {
		setCartItems((prevItems) => {
			const numericPrice = newItem.price;

			const existing = prevItems.find((item) => item.id === newItem.id);
			if (existing) {
				return prevItems.map((item) =>
					item.id === newItem.id ? { ...item, qty: item.qty + 1 } : item,
				);
			} else {
				return [...prevItems, { ...newItem, qty: 1, numericPrice }];
			}
		});
	}
	function increaseQty(id) {
		setCartItems((prevItems) =>
			prevItems.map((item) =>
				item.id === id ? { ...item, qty: item.qty + 1 } : item,
			),
		);
	}

	function decreaseQty(id) {
		setCartItems((prevItems) => {
			const updated = prevItems.map((item) =>
				item.id === id ? { ...item, qty: item.qty - 1 } : item,
			);
			return updated.filter((item) => item.qty > 0);
		});
	}

	function handleSearch(term) {
		setSearchTerm(term);
		const matches = product.filter((p) =>
			p.title.toLowerCase().includes(term.toLowerCase()),
		);
		if (matches.length === 0) {
			alert('No Products found Matching Your Search.');
		}
	}
	useEffect(() => {
		if (!searchTerm) {
			setScrollTarget(null);
			return;
		}
		const match = product.find((p) =>
			p.title.toLowerCase().includes(searchTerm.toLowerCase()),
		);
		if (match) {
			if (match.section === 'category') {
				setActiveCategory(match.category);
			}
			setScrollTarget(match.id);
		} else {
			setScrollTarget(null);
		}
	}, [searchTerm]);

	useEffect(() => {
		if (!scrollTarget) return;
		const el = document.getElementById(`product-${scrollTarget}`);
		if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
	}, [scrollTarget, activeCategory]);

	useEffect(() => {
		async function loadProducts() {
			try {
				const response = await fetch(`${API_URL}/products`);
				if (!response.ok) throw new Error('Server error: ' + response.status);
				const data = await response.json();
				console.log(data);
				console.log(
					data[0].statusText,
					data[0].statusClass,
					data[0].section,
					data[0].category,
				);
				setServerProducts(data);
			} catch (error) {
				console.error('Failed to load products:', error);
			}
		}
		loadProducts();
	}, []);

	function handleCategoryClick(id) {
		setActiveCategory(id);
		setScrollSignal((prev) => prev + 1);
	}
	return (
		<Routes>
			<Route
				path="/"
				element={
					<>
						<Navbar
							onSearch={handleSearch}
							cartItems={cartItems}
							onToggleCart={toggleCart}
							onSetAuthView={setAuthView}
							onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
							currentUser={currentUser}
							onLogout={handleLogout}
							onOpenMyOrders={() => setIsMyOrdersOpen(true)}
						/>
						<Hero />
						<Categories onCategoryClick={handleCategoryClick} />
						<Featured
							searchTerm={searchTerm}
							onAddToCart={addToCart}
							onBuyNow={openCheckoutWithItem}
							products={serverProducts}
						/>
						<BestSeller
							onBuyNow={openCheckoutWithItem}
							searchTerm={searchTerm}
							onAddToCart={addToCart}
							products={serverProducts}
						/>
						<Gallery />
						<NewArrival
							onBuyNow={openCheckoutWithItem}
							searchTerm={searchTerm}
							onAddToCart={addToCart}
							products={serverProducts}
						/>
						<AboutBrand />
						<TrustSection />
						<WhyUs />
						<CategoryProducts
							activeCategory={activeCategory}
							scrollSignal={scrollSignal}
							searchTerm={searchTerm}
							onAddToCart={addToCart}
							onBuyNow={openCheckoutWithItem}
							products={serverProducts}
						/>
						<CardPanel
							cartItems={cartItems}
							isCartOpen={isCartOpen}
							onToggleCart={toggleCart}
							onIncreaseQty={increaseQty}
							onDecreaseQty={decreaseQty}
							cartTotal={cartTotal}
							onOpenCheckout={openCheckoutFromCart}
						/>
						<CheckoutModal
							isCheckoutOpen={isCheckoutOpen}
							checkoutItems={checkoutItems}
							onClose={closeCheckout}
							onOrderComplete={setCompletedOrder}
							onClearCart={clearCart}
							currentUser={currentUser}
							authToken={authToken}
							checkoutFromCart={checkoutFromCart}
						/>
						<OrderComfirmation
							order={completedOrder}
							onClose={() => setCompletedOrder(null)}
						/>
						<TrackOrderModal
							isOpen={isTrackOrderOpen}
							onClose={() => setIsTrackOrderOpen(false)}
						/>

						<AuthModal
							onSetAuthView={setAuthView}
							onLoginSuccess={handleLoginSuccess}
							authView={authView}
						/>
						<Footer />
					</>
				}
			/>
			<Route path="/admin/login" element={<AdminLogin />} />
			<Route
				path="/admin"
				element={
					<AdminRoute>
						<AdminLayout />
					</AdminRoute>
				}
			>
				{/* <Route
					index
					element={
						<AdminPlaceholder
							title="Orders"
							text="Your stats and orders will appear here."
						/>
					}
				/> */}
				<Route index element={<AdminOrdersPage />} />

				<Route path="users" element={<AdminUsersPage />} />
				<Route path="orders/:id" element={<AdminOrderDetailPage />} />
				<Route path="analytics" element={<AdminAnalyticsPage />} />

				<Route path="settings" element={<AdminSettingsPage />} />
				<Route path="*" element={<Navigate to="/admin" replace />} />
			</Route>
			<Route
				path="/account"
				element={
					<AccountPage
						currentUser={currentUser}
						authToken={authToken}
						onLogout={handleLogout}
						onProfileUpdated={handleProfileUpdated}
					/>
				}
			/>
		</Routes>
	);
}
export default App;
