import { useState } from 'react';

function PasswordField(props) {
	const [isVisible, setIsVisible] = useState(false);

	return (
		<div className="ankara-auth-password-wrapper">
			<input
				type={isVisible ? 'text' : 'password'}
				id={props.id}
				className="ankara-auth-password-input"
				placeholder={props.placeholder}
				aria-label={props.placeholder}
				autoComplete={props.autoComplete}
				value={props.value}
				onChange={(e) => props.onChange(e.target.value)}
				required
			/>
			<button
				type="button"
				className="ankara-auth-password-toggle"
				aria-label={isVisible ? 'Hide password' : 'Show password'}
				onClick={() => setIsVisible(!isVisible)}
			>
				<i className={isVisible ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
			</button>
		</div>
	);
}

export default PasswordField;
