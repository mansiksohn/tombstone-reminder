'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { setPublished } from '@/lib/actions';

interface Props {
  published: boolean;
  hasEpitaph: boolean;
  url: string;
}

export default function PublishPanel({ published, hasEpitaph, url }: Props) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const toggle = () => {
    setError(null);
    startTransition(async () => {
      const result = await setPublished(!published);
      if (!result.ok) setError(result.error ?? '실패했습니다.');
    });
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError('링크를 복사하지 못했습니다.');
    }
  };

  return (
    <section className="share-section mt-6">
      {published ? (
        <div className="flex flex-col gap-3">
          <div className="share-url">{url}</div>
          <div className="flex gap-2">
            <button onClick={copy} className="rounded-lg flex-1">
              {copied ? '링크 복사됨' : '링크 복사'}
            </button>
            <Link href={`/t/${url.split('/t/')[1]}`} className="share-visit">
              묘비 보기
            </Link>
          </div>
          <button
            onClick={toggle}
            disabled={pending}
            className="unpublish-button"
          >
            {pending ? '처리 중…' : '비공개로 되돌리기'}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="publish-warning">
            게시하면 링크를 가진 누구나 이 묘비를 볼 수 있습니다.
          </p>
          <button onClick={toggle} disabled={pending || !hasEpitaph}>
            {pending ? '게시 중…' : '게시하기'}
          </button>
          {!hasEpitaph && (
            <p className="publish-warning">
              묘비에 새길 문장을 먼저 정해주세요.
            </p>
          )}
        </div>
      )}
      {error && <p className="text-soul-red text-sm mt-2">{error}</p>}
    </section>
  );
}
