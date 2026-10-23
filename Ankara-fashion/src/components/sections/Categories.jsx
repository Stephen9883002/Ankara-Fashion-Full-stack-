import CategoryCard from './CategoryCard';

function Categories(props) {
	return (
		<section className="categories" id="categories">
			<div className="section-title">
				<h2>Shop Categories</h2>
				<p>Discover our carefully selected fashion collections.</p>
			</div>

			<div className="category-grid">
				<CategoryCard
					image="./img/img 1A.WEBP"
					title="Dresses"
					categoryId="dresses"
					onCategoryClick={props.onCategoryClick}
				/>
				<CategoryCard
					image="./img/hand bag 1A.jpeg"
					title="Hand Bags"
					categoryId="hand bag"
					onCategoryClick={props.onCategoryClick}
				/>
				<CategoryCard
					image="./img/necklace 1a.jpeg"
					title="Jewelries"
					categoryId="jewelry"
					onCategoryClick={props.onCategoryClick}
				/>
				<CategoryCard
					image="./img/ladies top 1a.jpeg"
					title="Natives"
					categoryId="natives"
					onCategoryClick={props.onCategoryClick}
				/>
			</div>
		</section>
	);
}
export default Categories;
