'use client';

import Link from 'next/link';
import { useMemo, useState, useTransition } from 'react';
import { saveEulogy, setPublished } from '@/lib/actions';
import { splitSentences } from '@/lib/sentences';
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
  userName: string | null;
  slug: string;
  shareUrl: string;
  initialEulogy: string | null;
  initialSource: EulogySource | null;
  initialSentence: string | null;
  alreadyPublished: boolean;
}

export default function ComposeFlow({
  prompt,
  userName,
  slug,
  shareUrl,
  initialEulogy,
  initialSource,
  initialSentence,
  alreadyPublished,
}: Props) {
  const [step, setStep] = useState<Step>(
    initialEulogy ? 'select' : 'paste',
  );
  const [eulogy, setEulogy] = useState(initialEulogy ?? '');
  const [source, setSource] = useState<EulogySource | null>(initialSource);
  const [sentence, setSentence] = useState(initialSentence ?? '');
  const [customizing, setCustomizing] = useState(false);
  const [published, setPublishedState] = useState(alreadyPublished);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const sentences = useMemo(() => splitSentences(eulogy), [eulogy]);

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

  const save = (andPublish: boolean) => {
    setError(null);
    startTransition(async () => {
      const result = await saveEulogy(eulogy, source, sentence);
      if (!result.ok) {
        setError(result.error ?? '저장하지 못했습니다.');
        return;
      }

      if (!andPublish) {
        setStep('done');
        return;
      }

      const publishResult = await setPublished(true);
      if (!publishResult.ok) {
        setError(publishResult.error ?? '게시하지 못했습니다.');
        return;
      }
      setPublishedState(true);
      setStep('done');
    });
  };

  if (step === 'paste') {
    return (
      <div className="compose-container">
        <p className="compose-lead">
          당신이 어떤 사람이었는지, 저는 모릅니다.
          <br />
          하지만 아는 존재가 하나 있죠.
        </p>
        <p className="publish-warning">
          늘 쓰던 AI에게 아래 질문을 그대로 물어보세요. 돌아온 답을 여기에
          옮겨 적으면, 그게 당신의 추도문이 됩니다.
        </p>

        <PromptCard prompt={prompt} />

        <div className="flex gap-2">
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

        <textarea
          value={eulogy}
          onChange={(e) => setEulogy(e.target.value)}
          placeholder="여기에 답변을 붙여넣으세요."
          className="compose-textarea"
        />

        {error && <p className="text-soul-red text-sm">{error}</p>}

        <button onClick={toSelect} className="rounded-lg">
          다음
        </button>
        <Link href="/me" className="compose-cta text-center">
          내 묘비로 돌아가기
        </Link>
      </div>
    );
  }

  if (step === 'select') {
    return (
      <div className="compose-container">
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
      </div>
    );
  }

  if (step === 'preview') {
    return (
      <div className="compose-container">
        <p className="compose-lead">이렇게 새겨집니다.</p>

        <TombstoneSection tombName={sentence} />

        <div className="obituary-container">
          <p className="eulogy-body">{eulogy}</p>
        </div>

        <p className="publish-warning">
          게시하면 링크를 가진 누구나 {userName || '이 묘비'}를 볼 수
          있습니다. 나중에 언제든 비공개로 되돌릴 수 있습니다.
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
          <button onClick={() => save(false)} className="secondary-button" disabled={pending}>
            나중에 게시
          </button>
          <button onClick={() => save(true)} className="flex-1" disabled={pending}>
            {pending ? '게시 중…' : '지금 게시하기'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="compose-container">
      <p className="compose-lead">
        {published ? '게시됐습니다.' : '저장됐습니다.'}
      </p>
      {published && (
        <div className="share-url">{shareUrl}</div>
      )}
      <div className="flex gap-2">
        <Link href="/me" className="secondary-button text-center flex-1">
          내 묘비로
        </Link>
        {published && (
          <Link href={`/t/${slug}`} className="flex-1 text-center rounded-lg">
            묘비 보기
          </Link>
        )}
      </div>
    </div>
  );
}
