import { model, Schema, Types, type HydratedDocument, type Model } from 'mongoose';

export interface PostFields {
  author: Types.ObjectId;
  text?: string;
  image: string;
  tags: string[];
  likes: Types.ObjectId[];
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type PostDocument = HydratedDocument<PostFields>;

const postSchema = new Schema<PostFields, Model<PostFields>>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    text: {
      type: String,
      maxlength: 2000,
    },
    image: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      index: true,
      default: [],
    },
    likes: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

postSchema.pre('save', function () {
  const hashtags = this.text?.match(/#[\p{L}\p{N}_]+/gu) ?? [];
  this.tags = [...new Set(hashtags.map((hashtag) => hashtag.slice(1).toLowerCase()))];
});

export const PostModel = model<PostFields>('Post', postSchema);
