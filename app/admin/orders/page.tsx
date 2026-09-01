'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Orders } from '@/components/admin/Orders';
import { pageToHref, type NavigateFn } from '@/lib/navigation';

export default function OrdersPage() {
  const router = useRouter();

  const navigate = useCallback<NavigateFn>(
    (page, entityId) => {
      router.push(pageToHref(page, entityId));
    },
    [router],
  );

  return <Orders onNavigate={navigate} />;
}
