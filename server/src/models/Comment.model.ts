import { model, Schema, Types, type HydratedDocument, type Model } from 'mongoose';

export interface CommentFields {
  post: Types.ObjectId;
  author: Types.ObjectId;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CommentDocument = HydratedDocument<CommentFields>;

const commentSchema = new Schema<CommentFields, Model<CommentFields>>(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
      maxlength: 1000,
    },
  },
  { timestamps: true },
);

export const CommentModel = model<CommentFields>('Comment', commentSchema);
