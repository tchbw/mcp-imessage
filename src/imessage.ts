import { db } from "./db.js";
import { eq, desc, InferSelectModel } from "drizzle-orm";
import { runAppleScript } from "./mac.js";
import {
  chat,
  chatMessageJoin,
  message,
} from "./schemas/imessage.js";
import { ChatId } from "./schemas/types.js";

// Example: get recent chat messages
export async function getRecentChatMessages(phoneNumber: string, limit: number) {
  const chatResult = await db
    .select()
    .from(chat)
    .innerJoin(chatMessageJoin, eq(chatMessageJoin.chatId, chat.ROWID))
    .innerJoin(message, eq(chatMessageJoin.messageId, message.ROWID))
    .where(eq(chat.chatIdentifier, phoneNumber))
    .orderBy(desc(message.date))
    .limit(limit);

  // Reverse to ascending order
  chatResult.reverse();

  // Example "mapper"
  return chatResult.map(({ Message }) => ({
    id: Message.ROWID,
    text: getContentFromIMessage(Message),
    isFromMe: Message.isFromMe === 1,
    timestamp: Message.date,
  }));
}

// Example: send an iMessage with AppleScript
export async function sendIMessage(phoneNumber: string, content: string) {
  await runAppleScript({
    script: `
      tell application "Messages"
          set targetService to 1st service whose service type = iMessage
          set targetBuddy to buddy "${phoneNumber}" of targetService
          send "${content.replace(/"/g, '\\"')}" to targetBuddy
      end tell
    `,
  });
}

export function getContentFromIMessage(
  msg: InferSelectModel<typeof message>
): string | null {
  if (msg.text !== null) {
    return msg.text;
  }

  const attributedBody = msg.attributedBody as unknown as Buffer | null;

  if (!attributedBody) {
    return null;
  }

  return _parseAttributedBody(msg.attributedBody as unknown as Buffer);
}

function _parseAttributedBody(attributedBody: Buffer): string {
  const nsStringIndex = attributedBody.indexOf(`NSString`);
  if (nsStringIndex === -1) {
    throw new Error(`NSString not found in attributedBody`);
  }

  const content = attributedBody.subarray(
    nsStringIndex + `NSString`.length + 5
  );
  let length: number;
  let start: number;

  if (content[0] === 0x81) {
    length = content.readUInt16LE(1);
    start = 3;
  } else {
    length = content[0];
    start = 1;
  }

  return content.subarray(start, start + length).toString(`utf-8`);
}
