import { model, Schema, Types, type HydratedDocument, type Model } from 'mongoose';

export interface ConversationFields {
  participants: Types.ObjectId[];
  lastMessage: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ConversationDocument = HydratedDocument<ConversationFields>;

const conversationSchema = new Schema<ConversationFields, Model<ConversationFields>>(
  {
    participants: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      required: true,
      index: true,
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
  },
  { timestamps: true },
);

export const ConversationModel = model<ConversationFields>('Conversation', conversationSchema);
