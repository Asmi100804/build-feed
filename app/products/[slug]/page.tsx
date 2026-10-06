import SectionHeader from "@/components/ui/common/section-header";
import ProductSupportCard from "@/components/ui/products/product-support-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getApprovedProductSlugs,
  getProductBySlug,
} from "@/lib/products/product-select";
import { Suspense } from "react";
import {
  ArrowLeftIcon,
  CalendarIcon,
  ExternalLinkIcon,
  StarIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const generateStaticParams = async () => {
  const slugs = await getApprovedProductSlugs();
  return slugs.map((slug) => ({ slug: slug.toString() }));
};

export default function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<div className="py-16 wrapper">Loading...</div>}>
      <Product params={params} />
    </Suspense>
  );
}

async function Product({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const { name, description, websiteUrl, tags, voteCount, tagline } = product;

  return (
    <div className="py-16">
      <div className="wrapper">
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeftIcon className="size-4" /> Back to Explore
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-start gap-6">
              <div className="flex-1 min-w-0">
                <div className="mb-6">
                  <SectionHeader
                    title={name}
                    icon={StarIcon}
                    description={tagline ?? ""}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags?.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <h2 className="text-xl font-semibold mb-4">About</h2>
              <p className="text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>

            <div className="border rounded-lg p-6 bg-primary/10">
              <h2 className="text-lg font-semibold mb-4">Product Details</h2>

              <div className="space-y-3">
                {[
                  {
                    label: "Launched:",
                    value: new Date(
                      product.createdAt?.toISOString() ?? ""
                    ).toLocaleDateString(),
                    icon: CalendarIcon,
                  },
                  {
                    label: "Submitted by:",
                    value: product.submittedBy,
                    icon: UserIcon,
                  },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-3 text-sm">
                    {Icon && <Icon className="size-4 text-muted-foreground" />}
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Product Support & Voting Block */}
              <ProductSupportCard
                productId={product.id}
                userVote={product.userVote}
                voteCount={voteCount}
              />

              {websiteUrl && (
                <Button
                  asChild
                  className="w-full rounded-lg"
                  variant={"outline"}
                >
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit Website <ExternalLinkIcon className="size-4 ml-2" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}