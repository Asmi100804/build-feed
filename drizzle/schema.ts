import { pgTable, serial, varchar, text, json, integer, timestamp, index, uniqueIndex, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const products = pgTable("products", {
	id: serial().primaryKey(),
	name: varchar({ length: 120 }).notNull(),
	slug: varchar({ length: 140 }).notNull(),
	tagline: varchar({ length: 200 }),
	description: text(),
	websiteUrl: text("website_url"),
	tags: json(),
	voteCount: integer("vote_count").default(0).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
	approvedAt: timestamp("approved_at", { withTimezone: true }),
	status: varchar({ length: 20 }).default("pending"),
	submittedBy: varchar("submitted_by", { length: 120 }).default("anonymous"),
	userId: varchar("user_id", { length: 255 }),
	organizationId: varchar("organization_id", { length: 255 }),
}, (table) => [
	index("products_organization_idx").using("btree", table.organizationId.asc().nullsLast()),
	uniqueIndex("products_slug_idx").using("btree", table.slug.asc().nullsLast()),
	index("products_status_idx").using("btree", table.status.asc().nullsLast()),
]);
