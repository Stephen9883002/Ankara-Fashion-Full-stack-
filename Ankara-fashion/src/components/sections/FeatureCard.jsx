function FeatureCard(props) {
	return (
		<div className="feature-card">
			<h3>{props.title}</h3>
			<p>{props.description}</p>
		</div>
	);
}
export default FeatureCard;
