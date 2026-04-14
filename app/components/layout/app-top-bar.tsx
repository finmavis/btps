import { useMemo } from 'react';
import { Link } from 'react-router';
import { ArrowsLeftRightIcon, CheckIcon } from '@phosphor-icons/react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Button } from '~/components/ui/button';
import { formatRolesLabel } from '~/lib/user-role';
import { DEFAULT_BRAND_NAME } from '~/config/constants';
import { cn } from '~/lib/utils';
import { usePersistActiveUser } from '~/hooks/use-persist-active-user';
import { resolveInitials } from '~/utils/account-initials';
import { useAccount } from '~/state/account-context';

import styles from './app-top-bar.module.css';

export interface AppTopBarProps {
  brandName?: string;
  userInitials?: string;
}

export function AppTopBar({
  brandName = DEFAULT_BRAND_NAME,
  userInitials = '--',
}: AppTopBarProps) {
  const { users, selectedAccountId, setSelectedAccountId } = useAccount();
  const { persistSelection: persistActiveUserSelection } =
    usePersistActiveUser();

  const handleSelectAccount = (id: string) => {
    setSelectedAccountId(id);
    persistActiveUserSelection(id);
  };

  const activeUser = useMemo(
    () => users.find((user) => user.id === selectedAccountId),
    [users, selectedAccountId]
  );

  const activeUserInitials = useMemo(
    () =>
      activeUser
        ? resolveInitials(activeUser)
        : userInitials.slice(0, 2).toUpperCase(),
    [activeUser, userInitials]
  );

  return (
    <header className={styles.bar}>
      <div className={styles.inner}>
        <Link to='/' className={styles.brand} aria-label={`${brandName} home`}>
          <span className={styles.logo} aria-hidden>
            <ArrowsLeftRightIcon className={styles.logoSvg} weight='bold' />
          </span>
          <span className={styles.brandText}>{brandName}</span>
        </Link>
        <div className={styles.actions}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type='button'
                variant='default'
                size='icon'
                className={styles.avatarTrigger}
                aria-label='Switch account'
                aria-haspopup='menu'
              >
                {activeUserInitials}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align='end'
              sideOffset={8}
              className={styles.menuContent}
            >
              <DropdownMenuLabel className={styles.menuLabel}>
                Switch account
              </DropdownMenuLabel>
              {users.map((user) => {
                const selected = selectedAccountId === user.id;
                const initials = resolveInitials(user);
                return (
                  <DropdownMenuItem
                    key={user.id}
                    className={cn(styles.accountItem, {
                      [styles.accountItemActive]: selected,
                    })}
                    onSelect={() => {
                      handleSelectAccount(user.id);
                    }}
                  >
                    <span className={styles.accountAvatar} aria-hidden>
                      {initials}
                    </span>
                    <span className={styles.accountMeta}>
                      <span className={styles.accountName}>{user.name}</span>
                      <span className={styles.accountRole}>
                        {formatRolesLabel(user.roles)}
                      </span>
                    </span>
                    <span className={styles.checkSlot} aria-hidden>
                      {selected ? (
                        <CheckIcon
                          size={16}
                          weight='bold'
                          className={styles.accountCheck}
                        />
                      ) : null}
                    </span>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
