"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { productSchema } from "./product-validations";
import { db } from "@/db";
import { products } from "@/db/schema";
import z from "zod";
import { FormState } from "@/types";
import { sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const addProductAction = async (
  _prevState: FormState,
  formData: FormData
): Promise<FormState> => {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      return {
        success: false,
        errors: undefined,
        message: "You must be signed in to submit a product",
      };
    }

    if (!orgId) {
      return {
        success: false,
        errors: undefined,
        message:
          "You must be a member of an organization to submit a product",
      };
    }

    const user = await currentUser();
    const userEmail =
      user?.primaryEmailAddress?.emailAddress ?? "anonymous";

    const rawFormData = Object.fromEntries(formData.entries());

    const validatedData = productSchema.safeParse(rawFormData);

    if (!validatedData.success) {
      const fieldErrors = validatedData.error.flatten().fieldErrors;

      console.log(fieldErrors);

      return {
        success: false,
        errors: fieldErrors,
        message: "Invalid data",
      };
    }

    const {
      name,
      slug,
      tagline,
      description,
      websiteUrl,
      tags,
    } = validatedData.data;

    const tagsArray =
      tags?.filter((tag) => typeof tag === "string") ?? [];

    await db.insert(products).values({
      name,
      slug,
      tagline,
      description,
      websiteUrl,
      tags: tagsArray,
      status: "pending",
      submittedBy: userEmail,
      organizationId: orgId,
      userId,
    });

    return {
      success: true,
      errors: undefined,
      message:
        "Product submitted successfully! It will be reviewed shortly.",
    };
  } catch (error) {
    console.error(error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.flatten().fieldErrors,
        message: "Validation failed. Please check the form.",
      };
    }

    return {
      success: false,
      errors: undefined,
      message: "Failed to submit product",
    };
  }
};


type VoteValue = 1 | -1;

type VoteActionResult = {
  success: boolean;
  message: string;
  voteCount?: number;
  userVote?: VoteValue | null;
};

const voteOnProduct = async (
  productId: number,
  nextVote: VoteValue
): Promise<VoteActionResult> => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        message: "You must be signed in to vote",
      };
    }

    const result = await db.execute(sql<{
      voteCount: number;
      userVote: VoteValue | null;
    }>`
      WITH target_product AS (
        SELECT id
        FROM products
        WHERE id = ${productId}
      ), existing_vote AS (
        SELECT value
        FROM votes
        WHERE user_id = ${userId} AND product_id = ${productId}
      ), deleted_vote AS (
        DELETE FROM votes
        WHERE user_id = ${userId}
          AND product_id = ${productId}
          AND value = ${nextVote}
        RETURNING value
      ), upserted_vote AS (
        INSERT INTO votes (user_id, product_id, value, updated_at)
        SELECT ${userId}, id, ${nextVote}, now()
        FROM target_product
        WHERE NOT EXISTS (SELECT 1 FROM deleted_vote)
        ON CONFLICT (user_id, product_id)
        DO UPDATE SET value = EXCLUDED.value, updated_at = now()
        RETURNING value
      ), vote_delta AS (
        SELECT COALESCE((SELECT value FROM upserted_vote), 0)
          - COALESCE((SELECT value FROM existing_vote), 0) AS value
      )
      UPDATE products
      SET vote_count = vote_count + (SELECT value FROM vote_delta)
      WHERE id = ${productId}
      RETURNING vote_count AS "voteCount",
        (SELECT value FROM upserted_vote) AS "userVote"
    `);

    const updatedProduct = result.rows[0];

    if (!updatedProduct) {
      return {
        success: false,
        message: "Product not found",
      };
    }

    revalidatePath("/");
    revalidatePath("/explore");
    revalidatePath("/products/[slug]", "page");

    return {
      success: true,
      message: "Vote updated successfully",
      voteCount: Number(updatedProduct.voteCount),
      userVote: updatedProduct.userVote as VoteValue | null,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to update vote",
    };
  }
};

export const upvoteProductAction = async (productId: number) => {
  return voteOnProduct(productId, 1);
};

export const downvoteProductAction = async (productId: number) => {
  return voteOnProduct(productId, -1);
};
