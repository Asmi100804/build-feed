import { db } from "@/db";
import { products, votes } from "@/db/schema";
import { and, desc, eq, getTableColumns, sql } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { ProductType, UserVote } from "@/types";

const productSelectFields = (userId: string | null) => ({
  ...getTableColumns(products),
  userVote: userId ? votes.value : sql<1 | -1 | null>`null`,
});

const withCurrentUserVote = async () => {
  const { userId } = await auth();
  return userId;
};

const normalizeProducts = <T extends { userVote: number | null }>(
  productsData: T[]
): ProductType[] =>
  productsData.map((product) => ({
    ...product,
    userVote: product.userVote as UserVote,
  })) as unknown as ProductType[];

export async function getFeaturedProducts() {
  const userId = await withCurrentUserVote();
  const productsData = await db
    .select(productSelectFields(userId))
    .from(products)
    .leftJoin(
      votes,
      and(eq(votes.productId, products.id), eq(votes.userId, userId ?? ""))
    )
    .where(eq(products.status, "approved"))
    .orderBy(desc(products.voteCount));

  return normalizeProducts(productsData);
}

export async function getAllApprovedProducts() {
  const userId = await withCurrentUserVote();
  const productsData = await db
    .select(productSelectFields(userId))
    .from(products)
    .leftJoin(
      votes,
      and(eq(votes.productId, products.id), eq(votes.userId, userId ?? ""))
    )
    .where(eq(products.status, "approved"))
    .orderBy(desc(products.voteCount));

  return normalizeProducts(productsData);
}

export async function getAllProducts() {
  const userId = await withCurrentUserVote();
  const productsData = await db
    .select(productSelectFields(userId))
    .from(products)
    .leftJoin(
      votes,
      and(eq(votes.productId, products.id), eq(votes.userId, userId ?? ""))
    )
    .orderBy(desc(products.voteCount));

  return normalizeProducts(productsData);
}

export async function getRecentlyLaunchedProducts() {
  const productsData = await getAllProducts();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  return productsData.filter(
    (product) =>
      product.createdAt &&
      new Date(product.createdAt.toISOString()) >= oneWeekAgo
  );
}

export async function getProductBySlug(slug: string) {
  const userId = await withCurrentUserVote();
  const product = await db
    .select(productSelectFields(userId))
    .from(products)
    .leftJoin(
      votes,
      and(eq(votes.productId, products.id), eq(votes.userId, userId ?? ""))
    )
    .where(eq(products.slug, slug))
    .limit(1);

  return product[0]
    ? ({
        ...product[0],
        userVote: product[0].userVote as UserVote,
      } satisfies ProductType)
    : null;
}
