import {
  CommentModel,
  ConversationModel,
  MessageModel,
  NotificationModel,
  PostModel,
  UserModel,
} from '../models';

type ClearDatabaseResult = {
  collections: number;
  documents: number;
};

export async function clearDatabase(): Promise<ClearDatabaseResult> {
  const results = await Promise.all([
    UserModel.deleteMany({}),
    PostModel.deleteMany({}),
    CommentModel.deleteMany({}),
    ConversationModel.deleteMany({}),
    MessageModel.deleteMany({}),
    NotificationModel.deleteMany({}),
  ]);

  return {
    collections: results.length,
    documents: results.reduce((total, result) => total + result.deletedCount, 0),
  };
}
