'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { setPublished } from '@/lib/actions';
import { useLocale } from './LocaleProvider';

interface Props {
  published: boolean;
  hasEpitaph: boolean;
  url: string;
}

export default function PublishPanel({ published, hasEpitaph, url }: Props) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const { t } = useLocale();

  const toggle = () => {
    setError(null);
    startTransition(async () => {
      const result = await setPublished(!published);
      if (!result.ok) setError(result.error ?? t.publish.genericFailed);
    });
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError(t.publish.copyFailed);
    }
  };

  return (
    <section className="share-section mt-6">
      {published ? (
        <div className="flex flex-col gap-3">
          <div className="share-url">{url}</div>
          <div className="flex gap-2">
            <button onClick={copy} className="rounded-lg flex-1">
              {copied ? t.publish.linkCopied : t.publish.copyLink}
            </button>
            <Link href={`/t/${url.split('/t/')[1]}`} className="share-visit">
              {t.publish.viewTomb}
            </Link>
          </div>
          <button
            onClick={toggle}
            disabled={pending}
            className="unpublish-button"
          >
            {pending ? t.publish.processing : t.publish.revertToPrivate}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="publish-warning">{t.publish.publishNotice}</p>
          <button onClick={toggle} disabled={pending || !hasEpitaph}>
            {pending ? t.publish.publishing : t.publish.publish}
          </button>
          {!hasEpitaph && (
            <p className="publish-warning">
              {t.errors.needEpitaphBeforePublish}
            </p>
          )}
        </div>
      )}
      {error && <p className="text-soul-red text-sm mt-2">{error}</p>}
    </section>
  );
}
