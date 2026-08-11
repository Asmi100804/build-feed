import FeaturedProducts from "@/components/ui/landing-page/featured-products"
import HeroSection from "@/components/ui/landing-page/hero-section"
import RecentlyLaunchedProducts from "@/components/ui/landing-page/recently-launched-products"
import ProductSkeleton from "@/components/ui/products/product-skeleton";
import { Suspense } from "react";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <FeaturedProducts />
      <Suspense fallback={<ProductSkeleton />}>
        <RecentlyLaunchedProducts />
      </Suspense>
    </div>
  )
}
