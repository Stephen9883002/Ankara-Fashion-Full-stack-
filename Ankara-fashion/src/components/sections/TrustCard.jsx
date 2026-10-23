function TrustCard(props) {
	return (
		<div className="trust-card">
			<div className="trust-icon">{props.icon}</div>
			<h3>{props.title}</h3>
			<p>{props.description}</p>
		</div>
	);
}
export default TrustCard;
