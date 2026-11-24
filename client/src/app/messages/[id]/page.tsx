import { Messenger } from '@/widgets/messenger';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ConversationRoute({ params }: Props) {
  const { id } = await params;

  return <Messenger conversationId={id} />;
}
