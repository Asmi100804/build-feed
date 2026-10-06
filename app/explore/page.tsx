import { Suspense } from "react";
import SectionHeader from "@/components/ui/common/section-header";
import ProductExplorer from "@/components/ui/products/product-explorer";
import { getAllApprovedProducts } from "@/lib/products/product-select";
import { CompassIcon } from "lucide-react";

async function ProductList() {
  const products = await getAllApprovedProducts();
  return <ProductExplorer products={products} />;
}

function ProductExplorerSkeleton() {
  return (
    <div className="w-full h-64 flex items-center justify-center text-muted-foreground animate-pulse">
      Loading products...
    </div>
  );
}

export default function ExplorePage() {
  return (
    <div className="py-20">
      <div className="wrapper">
        <div className="mb-12">
          <SectionHeader
            title="Explore All Products"
            icon={CompassIcon}
            description="Browse and discover amazing projects from our community"
          />
        </div>
        
        <Suspense fallback={<ProductExplorerSkeleton />}>
          <ProductList />
        </Suspense>
      </div>
    </div>
  );
}