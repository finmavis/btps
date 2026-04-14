import { DotsThreeVerticalIcon } from '@phosphor-icons/react';

import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import type { BatchTransaction } from '~/types/transaction';

export interface RowActionsMenuProps {
  row: BatchTransaction;
  onViewDetails: (row: BatchTransaction) => void;
  showApprove?: boolean;
}

export function RowActionsMenu({
  row,
  onViewDetails,
  showApprove = false,
}: RowActionsMenuProps) {
  const { batchId } = row;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          aria-label={`Actions for ${batchId}`}
        >
          <DotsThreeVerticalIcon size={16} weight='bold' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onSelect={() => onViewDetails(row)}>
          View details
        </DropdownMenuItem>
        {showApprove ? (
          <DropdownMenuItem onSelect={() => onViewDetails(row)}>
            Approve
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
