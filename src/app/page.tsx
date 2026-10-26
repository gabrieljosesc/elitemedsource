import Hero from "@/components/home/Hero";
import TrustStrip from "@/components/home/TrustStrip";
import RheumatologySpotlight from "@/components/home/RheumatologySpotlight";
import Categories from "@/components/home/Categories";
import BestSellers from "@/components/home/BestSellers";
import Brands from "@/components/home/Brands";
import TradeBand from "@/components/home/TradeBand";
import {
  getHomeCategories,
  getBestSellers,
  getHeroProducts,
  getFocusCategoryProducts,
} from "@/lib/home-data";

export default async function HomePage() {
  const [categories, bestSellers, heroProducts, rheumatology] = await Promise.all([
    getHomeCategories(),
    getBestSellers(),
    getHeroProducts(),
    getFocusCategoryProducts(9),
  ]);

  return (
    <>
      <Hero products={heroProducts} />
      <TrustStrip />
      <RheumatologySpotlight products={rheumatology} />
      <Categories categories={categories} />
      <BestSellers products={bestSellers} />
      <Brands />
      <TradeBand />
    </>
  );
}
