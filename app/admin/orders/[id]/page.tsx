'use client';

import { useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { OrderDetail } from '@/components/admin/OrderDetail';
import { pageToHref, type NavigateFn } from '@/lib/navigation';

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const navigate = useCallback<NavigateFn>(
    (page, entityId) => {
      router.push(pageToHref(page, entityId));
    },
    [router],
  );

  return <OrderDetail onNavigate={navigate} orderId={params.id} />;
}
