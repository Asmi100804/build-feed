import { InferSelectModel } from "drizzle-orm";
import { products } from "@/db/schema";

export type FormState = {
  success: boolean;
  errors?: Record<string, string[]>;
  message: string;
};

export type UserVote = 1 | -1 | null;
export type ProductType = InferSelectModel<typeof products> & {
  userVote: UserVote;
};
