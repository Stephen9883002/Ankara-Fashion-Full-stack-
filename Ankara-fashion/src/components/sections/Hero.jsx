import '../../components/sections/premium-hero.css';

function Hero() {
	return (
		<section className="ankara-premium-hero-showcase" id="hero">
			<div className="ankara-hero-inner-content">
				<p className="ankara-hero-eyebrow">New Ankara Collection</p>
				<h2 className="ankara-hero-title-main">
					Fashion That Speaks Before You Do
				</h2>
				<p className="ankara-hero-description">
					Discover premium fashion pieces, elegant styles and timeless outfits
					curated for every occasion.
				</p>
				<button className="ankara-hero-cta-action" type="button">
					Shop with style
				</button>
			</div>
		</section>
	);
}

export default Hero;
