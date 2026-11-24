import { useState, type MouseEvent } from 'react';

import { useClearConversationMessagesMutation } from '@/entities/message';

type Params = {
  conversationId: string;
};

type ConversationClearController = {
  anchorEl: HTMLElement | null;
  isDialogOpen: boolean;
  isSnackbarOpen: boolean;
  isClearing: boolean;
  clearError: boolean;
  openMenuHandler: (event: MouseEvent<HTMLButtonElement>) => void;
  closeMenuHandler: () => void;
  openDialogHandler: () => void;
  closeDialogHandler: () => void;
  confirmClearHandler: () => Promise<void>;
  closeSnackbarHandler: () => void;
};

export function useConversationClear({ conversationId }: Params): ConversationClearController {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [clearError, setClearError] = useState(false);
  const [clearConversationMessages, { isLoading: isClearing }] =
    useClearConversationMessagesMutation();

  const openMenuHandler = (event: MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const closeMenuHandler = (): void => {
    setAnchorEl(null);
  };

  const openDialogHandler = (): void => {
    setAnchorEl(null);
    setClearError(false);
    setIsDialogOpen(true);
  };

  const closeDialogHandler = (): void => {
    setIsDialogOpen(false);
  };

  const confirmClearHandler = async (): Promise<void> => {
    setClearError(false);

    try {
      await clearConversationMessages(conversationId).unwrap();
      setIsDialogOpen(false);
      setIsSnackbarOpen(true);
    } catch {
      setClearError(true);
    }
  };

  const closeSnackbarHandler = (): void => {
    setIsSnackbarOpen(false);
  };

  return {
    anchorEl,
    isDialogOpen,
    isSnackbarOpen,
    isClearing,
    clearError,
    openMenuHandler,
    closeMenuHandler,
    openDialogHandler,
    closeDialogHandler,
    confirmClearHandler,
    closeSnackbarHandler,
  };
}
