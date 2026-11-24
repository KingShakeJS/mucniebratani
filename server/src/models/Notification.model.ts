import { model, Schema, Types, type HydratedDocument, type Model } from 'mongoose';

export type NotificationType = 'like' | 'comment' | 'follow';

export interface NotificationFields {
  recipient: Types.ObjectId;
  sender: Types.ObjectId;
  type: NotificationType;
  post: Types.ObjectId | null;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type NotificationDocument = HydratedDocument<NotificationFields>;

const notificationSchema = new Schema<NotificationFields, Model<NotificationFields>>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['like', 'comment', 'follow'],
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const NotificationModel = model<NotificationFields>('Notification', notificationSchema);
