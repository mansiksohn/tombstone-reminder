'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { saveEulogy, setPublished } from '@/lib/actions';
import { splitSentences } from '@/lib/sentences';
import { clearDraft, readDraft, saveDraft } from '@/lib/draft';
import { createClient } from '@/lib/supabase/client';
import type { EulogySource } from '@/lib/database.types';
import PromptCard from './PromptCard';
import TombstoneSection from './TombstoneSection';

const SOURCES: { value: EulogySource; label: string }[] = [
  { value: 'chatgpt', label: 'ChatGPT' },
  { value: 'claude', label: 'Claude' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'other', label: '그 외' },
];

type Step = 'paste' | 'select' | 'preview' | 'done';

interface Props {
  prompt: string;
  loggedIn: boolean;
  slug: string | null;
  shareUrl: string | null;
  initialEulogy: string | null;
  initialSource: EulogySource | null;
  initialSentence: string | null;
  alreadyPublished: boolean;
}

export default function CreateFlow({
  prompt,
  loggedIn,
  slug,
  shareUrl,
  initialEulogy,
  initialSource,
  initialSentence,
  alreadyPublished,
}: Props) {
  const [step, setStep] = useState<Step>(initialEulogy ? 'select' : 'paste');
  const [eulogy, setEulogy] = useState(initialEulogy ?? '');
  const [source, setSource] = useState<EulogySource | null>(initialSource);
  const [sentence, setSentence] = useState(initialSentence ?? '');
  const [customizing, setCustomizing] = useState(false);
  const [published, setPublishedState] = useState(alreadyPublished);
  const [error, setError] = useState<string | null>(null);
  const [resuming, setResuming] = useState(false);
  const [pending, startTransition] = useTransition();

  const sentences = useMemo(() => splitSentences(eulogy), [eulogy]);

  const publish = useCallback(
    (draftEulogy: string, draftSource: EulogySource | null, draftSentence: string) => {
      setError(null);
      startTransition(async () => {
        const saved = await saveEulogy(draftEulogy, draftSource, draftSentence);
        if (!saved.ok) {
          setError(saved.error ?? '저장하지 못했습니다.');
          setResuming(false);
          return;
        }

        const result = await setPublished(true);
        if (!result.ok) {
          setError(result.error ?? '게시하지 못했습니다.');
          setResuming(false);
          return;
        }

        clearDraft();
        setPublishedState(true);
        setResuming(false);
        setStep('done');
      });
    },
    [],
  );

  // 로그인하고 돌아왔을 때, 로그인 전에 누른 게시를 이어서 마친다.
  // 초안이 있다는 것은 이미 게시를 눌렀다는 뜻이므로 다시 묻지 않는다.
  const resumed = useRef(false);
  useEffect(() => {
    if (!loggedIn || resumed.current) return;

    const draft = readDraft();
    if (!draft) return;

    resumed.current = true;
    setEulogy(draft.eulogy);
    setSource(draft.source);
    setSentence(draft.sentence);
    setStep('preview');
    setResuming(true);
    publish(draft.eulogy, draft.source, draft.sentence);
  }, [loggedIn, publish]);

  const toSelect = () => {
    if (!eulogy.trim()) {
      setError('붙여넣은 답변이 비어 있습니다.');
      return;
    }
    setError(null);
    setStep('select');
  };

  const toPreview = () => {
    if (!sentence.trim()) {
      setError('묘비에 새길 문장을 골라주세요.');
      return;
    }
    setError(null);
    setStep('preview');
  };

  /** 게시. 로그인하지 않았다면 초안을 맡겨두고 구글로 보낸다. */
  const onPublish = async () => {
    if (loggedIn) {
      publish(eulogy, source, sentence);
      return;
    }

    saveDraft({ eulogy, source, sentence });

    // createClient()는 설정이 없으면 예외를 던진다. 잡지 않으면 uncaught
    // promise로 새어나가 버튼을 눌러도 화면에 아무 일도 일어나지 않는다.
    // 사용자에게는 앱이 그냥 죽은 것처럼 보이므로 반드시 표면화한다.
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/new`,
        },
      });

      if (authError) throw authError;
    } catch (cause) {
      console.error('로그인 시작 실패:', cause);
      setError(
        '로그인을 시작하지 못했습니다. 잠시 후 다시 시도해주세요. ' +
          '문제가 계속되면 관리자에게 알려주세요.',
      );
    }
  };

  if (resuming) {
    return (
      <main className="compose-container">
        <p className="compose-lead">묘비를 세우는 중입니다…</p>
        {error && (
          <>
            <p className="text-soul-red text-sm">{error}</p>
            <button onClick={() => publish(eulogy, source, sentence)}>
              다시 시도
            </button>
          </>
        )}
      </main>
    );
  }

  if (step === 'paste') {
    return (
      <main className="compose-container">
        <p className="compose-lead">
          AI가 돌려준 답을 그대로 붙여넣으세요.
        </p>

        <details className="prompt-details">
          <summary>질문을 다시 보기</summary>
          <div className="pt-3">
            <PromptCard prompt={prompt} />
          </div>
        </details>

        <textarea
          value={eulogy}
          onChange={(e) => setEulogy(e.target.value)}
          placeholder="여기에 답변을 붙여넣으세요."
          className="compose-textarea"
          autoFocus
        />

        <div className="flex flex-wrap gap-2">
          {SOURCES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setSource(s.value)}
              aria-pressed={source === s.value}
              className="source-chip"
            >
              {s.label}
            </button>
          ))}
        </div>

        {error && <p className="text-soul-red text-sm">{error}</p>}

        <button onClick={toSelect} className="rounded-lg">
          다음
        </button>
      </main>
    );
  }

  if (step === 'select') {
    return (
      <main className="compose-container">
        <p className="compose-lead">
          이 중에서, 묘비에 새길 한 문장을 골라주세요.
        </p>

        {customizing ? (
          <textarea
            value={sentence}
            onChange={(e) => setSentence(e.target.value)}
            maxLength={200}
            className="compose-textarea"
            autoFocus
          />
        ) : (
          <div className="flex flex-col gap-2">
            {sentences.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSentence(s)}
                aria-pressed={sentence === s}
                className="sentence-card"
              >
                {s}
              </button>
            ))}
            {sentences.length === 0 && (
              <p className="publish-warning">
                문장으로 나눌 수 없었습니다. 직접 입력해주세요.
              </p>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => setCustomizing((v) => !v)}
          className="unpublish-button"
        >
          {customizing ? '목록에서 고르기' : '직접 다듬기'}
        </button>

        {error && <p className="text-soul-red text-sm">{error}</p>}

        <div className="flex gap-2">
          <button onClick={() => setStep('paste')} className="secondary-button">
            이전
          </button>
          <button onClick={toPreview} className="flex-1">
            다음
          </button>
        </div>
      </main>
    );
  }

  if (step === 'preview') {
    return (
      <main className="compose-container">
        <p className="compose-lead">이렇게 새겨집니다.</p>

        <TombstoneSection tombName={sentence} />

        <div className="obituary-container">
          <p className="eulogy-body">{eulogy}</p>
        </div>

        <p className="publish-warning">
          게시하면 링크를 가진 누구나 이 묘비를 볼 수 있습니다. 언제든
          비공개로 되돌릴 수 있습니다.
          {!loggedIn && ' 묘비를 간직하려면 구글 로그인이 필요합니다.'}
        </p>

        {error && <p className="text-soul-red text-sm">{error}</p>}

        <div className="flex gap-2">
          <button
            onClick={() => setStep('select')}
            className="secondary-button"
            disabled={pending}
          >
            이전
          </button>
          <button onClick={onPublish} className="flex-1" disabled={pending}>
            {pending ? '게시 중…' : loggedIn ? '게시하기' : '로그인하고 게시하기'}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="compose-container">
      <p className="compose-lead">
        {published ? '묘비가 세워졌습니다.' : '저장됐습니다.'}
      </p>

      {published && shareUrl && <ShareBox url={shareUrl} />}

      <div className="flex gap-2">
        <Link href="/me" className="secondary-button text-center flex-1">
          꾸미러 가기
        </Link>
        {published && slug && (
          <Link href={`/t/${slug}`} className="flex-1 text-center rounded-lg landing-cta">
            묘비 보기
          </Link>
        )}
      </div>
    </main>
  );
}

function ShareBox({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 클립보드가 막힌 환경에서는 직접 긁어서 복사하면 된다.
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="share-url">{url}</div>
      <button onClick={copy} className="rounded-lg">
        {copied ? '링크 복사됨' : '링크 복사'}
      </button>
    </div>
  );
}
