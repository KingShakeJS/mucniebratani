import { USER_ROLES, type UserRole } from '@social/shared';
import { model, Schema, Types, type HydratedDocument, type Model } from 'mongoose';

export interface UserFields {
  username: string;
  email: string;
  role: UserRole;
  passwordHash: string;
  avatar: string;
  bio: string;
  followers: Types.ObjectId[];
  following: Types.ObjectId[];
  isOnline: boolean;
  isVerified: boolean;
  verificationCodeHash: string | null;
  verificationCodeExpires: Date | null;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = HydratedDocument<UserFields>;

const userSchema = new Schema<UserFields, Model<UserFields>>(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: [...USER_ROLES],
      default: 'user',
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
      maxlength: 300,
    },
    followers: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },
    following: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationCodeHash: {
      type: String,
      default: null,
      select: false,
    },
    verificationCodeExpires: {
      type: Date,
      default: null,
      select: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

userSchema.index({ username: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

export const UserModel = model<UserFields>('User', userSchema);
