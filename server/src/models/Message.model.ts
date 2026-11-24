import { model, Schema, Types, type HydratedDocument, type Model } from 'mongoose';

export interface MessageFields {
  conversation: Types.ObjectId;
  sender: Types.ObjectId;
  text: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type MessageDocument = HydratedDocument<MessageFields>;

const messageSchema = new Schema<MessageFields, Model<MessageFields>>(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const MessageModel = model<MessageFields>('Message', messageSchema);
