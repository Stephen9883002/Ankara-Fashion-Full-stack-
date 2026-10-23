function CategoryCard(props) {
	return (
		<div
			className="category-card"
			onClick={() => props.onCategoryClick(props.categoryId)}
		>
			<img src={props.image} alt="Dresses" />
			<h3>{props.title}</h3>
			<button type="button">Explore More</button>
		</div>
	);
}
export default CategoryCard;
