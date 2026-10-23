function AdminPlaceholder(props) {
	return (
		<div>
			<h1 className="admin-page-title">{props.title}</h1>
			<p className="admin-page-subtitle">{props.text}</p>
		</div>
	);
}

export default AdminPlaceholder;
