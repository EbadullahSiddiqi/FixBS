import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const wishlists = pgTable("wishlists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
});
