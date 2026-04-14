import { useCallback, useEffect, useRef } from 'react';
import { useFetcher, useRevalidator } from 'react-router';

export function usePersistActiveUser() {
  const fetcher = useFetcher();
  const revalidator = useRevalidator();
  const wasSubmitting = useRef(false);

  useEffect(() => {
    if (fetcher.state === 'submitting') {
      wasSubmitting.current = true;
      return;
    }
    if (fetcher.state !== 'idle' || !wasSubmitting.current) {
      return;
    }
    wasSubmitting.current = false;
    if ((fetcher.data as { ok?: boolean } | undefined)?.ok) {
      revalidator.revalidate();
    }
  }, [fetcher.state, fetcher.data, revalidator]);

  const persistSelection = useCallback(
    (id: string) => {
      const fd = new FormData();
      fd.set('userId', id);
      fetcher.submit(fd, {
        method: 'post',
        action: '/api/set-active-user',
      });
    },
    [fetcher]
  );

  return {
    persistSelection,
    isPersisting: fetcher.state !== 'idle',
  };
}
