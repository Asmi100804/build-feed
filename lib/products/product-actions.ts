"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { productSchema } from "./product-validations";
import { db } from "@/db";
import { products } from "@/db/schema";
import z from "zod";
import { FormState } from "@/types";
import { eq, sql } from "drizzle-orm";
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

export const upvoteProductAction = async (productId: number) => {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      console.log("User not signed in");
      return {
        success: false,
        message: "You must be signed in to submit a product",
      };
    }

    if (!orgId) {
      console.log("User not a member of an organization");
      return {
        success: false,
        message: "You must be a member of an organization to submit a product",
      };
    }

    await db
      .update(products)
      .set({
        voteCount: sql`GREATEST(0, vote_count + 1)`,
      })
      .where(eq(products.id, productId));

    revalidatePath("/");

    return {
      success: true,
      message: "Product upvoted successfully",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to upvote product",
      voteCount: 0,
    };
  }
};

export const downvoteProductAction = async (productId: number) => {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      console.log("User not signed in");
      return {
        success: false,
        message: "You must be signed in to submit a product",
      };
    }

    if (!orgId) {
      console.log("User not a member of an organization");
      return {
        success: false,
        message: "You must be a member of an organization to submit a product",
      };
    }

    await db
      .update(products)
      .set({
        voteCount: sql`GREATEST(0, vote_count - 1)`,
      })
      .where(eq(products.id, productId));

    revalidatePath("/");

    return {
      success: true,
      message: "Product downvoted successfully",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to downvote product",
      voteCount: 0,
    };
  }
};