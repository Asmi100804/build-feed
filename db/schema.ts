import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  timestamp,
  json,
  uniqueIndex,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ============= PRODUCTS =============
export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),

    // Core product info
    name: varchar("name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 140 }).notNull(),
    tagline: varchar("tagline", { length: 200 }),
    description: text("description"),

    // Links & media
    websiteUrl: text("website_url"),
    tags: json("tags").$type<string[]>(), // e.g. ["AI", "Productivity"]

    // Voting
    voteCount: integer("vote_count").notNull().default(0),

    // Metadata
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    status: varchar("status", { length: 20 }).default("pending"), // pending | approved | rejected
    submittedBy: varchar("submitted_by", { length: 120 }).default("anonymous"),
    userId: varchar("user_id", { length: 255 }), // Clerk user ID

    // Organization reference (for backend queries only)
    organizationId: varchar("organization_id", { length: 255 }), // Clerk org ID
  },
  (table) => ({
    slugIdx: uniqueIndex("products_slug_idx").on(table.slug),
    statusIdx: index("products_status_idx").on(table.status),
    organizationIdx: index("products_organization_idx").on(
      table.organizationId
    ),
  })
);

// ============= VOTES =============
export const votes = pgTable(
  "votes",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id", { length: 255 }).notNull(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    value: integer("value").notNull(), // 1 for upvote, -1 for downvote
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    userProductIdx: uniqueIndex("votes_user_product_idx").on(
      table.userId,
      table.productId
    ),
    productIdx: index("votes_product_idx").on(table.productId),
    valueCheck: check("votes_value_check", sql`${table.value} IN (1, -1)`),
  })
);
