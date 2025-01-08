import {
  sqliteTable,
  text,
  integer,
  primaryKey,
  blob,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const chat = sqliteTable("Chat", {
  ROWID: integer("ROWID").primaryKey(),
  guid: text("guid").notNull(),
  chatIdentifier: text("chat_identifier").notNull(),
  displayName: text("display_name"),
  lastReadMessageTimestamp: blob("last_read_message_timestamp"),
});

export const handle = sqliteTable("Handle", {
  ROWID: integer("ROWID").primaryKey(),
  id: text("id").notNull(),
});

export const message = sqliteTable("Message", {
  ROWID: integer("ROWID").primaryKey(),
  guid: text("guid").notNull(),
  text: text("text"),
  handleId: integer("handle_id").references(() => handle.ROWID),
  date: integer("date").notNull(),
  attributedBody: blob("attributedBody"),
  isFromMe: integer("is_from_me"),
});

export const chatMessageJoin = sqliteTable(
  "chat_message_join",
  {
    chatId: integer("chat_id").references(() => chat.ROWID),
    messageId: integer("message_id").references(() => message.ROWID),
  },
  (table) => ({
    pk: primaryKey(table.chatId, table.messageId),
  })
);

// Optional example relations (if needed)
export const chatRelations = relations(chat, ({ many }) => ({
  messages: many(chatMessageJoin),
}));

export const handleRelations = relations(handle, ({ many }) => ({
  messages: many(message),
}));

export const messageRelations = relations(message, ({ one, many }) => ({
  handle: one(handle, {
    fields: [message.handleId],
    references: [handle.ROWID],
  }),
  chats: many(chatMessageJoin),
}));
