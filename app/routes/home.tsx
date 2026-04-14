import { redirect, useLoaderData } from 'react-router';

import { BatchTransactionsPage } from '~/features/batch-transactions/batch-transaction-list/batch-transaction-table/batch-transactions-page';
import {
  mergeBatchFiltersIntoSearchParams,
  parseBatchFiltersFromSearchParams,
  parseDateOrder,
} from '~/features/batch-transactions/utils/filter-search-params';
import type { BatchTransactionsQueryResult } from '~/types/transaction';
import { runBatchTransactionsQuery } from '~/server/query-batch-transactions.server';
import type { Route } from './+types/home';

export async function loader({ request }: Route.LoaderArgs) {
  const { getTransactions } =
    await import('~/server/batch-transactions-store.server');
  const url = new URL(request.url);
  const applied = parseBatchFiltersFromSearchParams(url.searchParams);
  const dateOrder = parseDateOrder(url.searchParams);

  const result = runBatchTransactionsQuery(
    getTransactions(),
    applied,
    dateOrder
  );

  if (result.page !== applied.page) {
    const params = mergeBatchFiltersIntoSearchParams(url.searchParams, {
      page: result.page,
    });
    const qs = params.toString();
    return redirect(qs ? `${url.pathname}?${qs}` : url.pathname);
  }

  return result;
}

export function meta() {
  return [
    { title: 'Batch Transactions' },
    {
      name: 'description',
      content: 'View and manage your batch transfers',
    },
  ];
}

export default function Home() {
  const view = useLoaderData() as BatchTransactionsQueryResult;
  return <BatchTransactionsPage view={view} />;
}
