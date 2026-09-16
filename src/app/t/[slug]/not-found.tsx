import { getServerDictionary } from '@/lib/i18n/server';

export default async function TombNotFound() {
  const t = await getServerDictionary();

  return (
    <div className="flex min-h-screen items-center justify-center text-center">
      <p className="text-grey-999">{t.notFound.tombGone}</p>
    </div>
  );
}
