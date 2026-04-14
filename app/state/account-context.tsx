import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { User, UserRole } from '~/types/user';

export interface AccountOption {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
  initials?: string;
}

interface AccountContextValue {
  users: User[];
  selectedAccountId: string;
  selectedAccount: AccountOption | undefined;
  setSelectedAccountId: (id: string) => void;
}

const AccountContext = createContext<AccountContextValue | null>(null);

export type AccountProviderProps = {
  children: ReactNode;
  users: User[];
  activeUserId?: string;
};

export function AccountProvider({
  children,
  users,
  activeUserId,
}: AccountProviderProps) {
  const fallbackId = users[0]?.id ?? '';
  const initialId = activeUserId ?? fallbackId;
  const [selectedAccountId, setSelectedAccountIdState] = useState(initialId);

  useEffect(() => {
    if (users.length === 0) {
      return;
    }
    const exists = users.some((user) => user.id === selectedAccountId);
    if (!exists) {
      setSelectedAccountIdState(activeUserId ?? users[0].id);
    }
  }, [users, activeUserId, selectedAccountId]);

  const setSelectedAccountId = useCallback((id: string) => {
    setSelectedAccountIdState(id);
  }, []);

  const selectedAccount = useMemo(
    () => users.find((user) => user.id === selectedAccountId),
    [users, selectedAccountId]
  );

  const value = useMemo(
    (): AccountContextValue => ({
      users,
      selectedAccountId,
      selectedAccount,
      setSelectedAccountId,
    }),
    [users, selectedAccount, selectedAccountId, setSelectedAccountId]
  );

  return (
    <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
  );
}

export function useAccount(): AccountContextValue {
  const ctx = useContext(AccountContext);
  if (!ctx) {
    throw new Error('useAccount must be used within AccountProvider');
  }
  return ctx;
}
