'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { saveEulogy, setPublished } from '@/lib/actions';
import { splitSentences } from '@/lib/sentences';
import { toPlainText } from '@/lib/markdown';
import { clearDraft, readDraft, saveDraft } from '@/lib/draft';
import { signInWithGoogle, takeAfterLogin } from '@/lib/auth';
import { EPITAPH_MAX } from '@/lib/limits';
import { AI_MODELS } from '@/lib/models';
import type { EulogySource } from '@/lib/database.types';
import PromptCard from './PromptCard';
import TombstoneSection from './TombstoneSection';

type Step = 'paste' | 'select' | 'preview';

interface Props {
  prompt: string;
  loggedIn: boolean;
  /** 로그인 콜백이 실패해 되돌아온 경우의 사유. */
  authError?: string | null;
  initialEulogy: string | null;
  initialSource: EulogySource | null;
  initialSentence: string | null;
  alreadyPublished: boolean;
}

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  auth_failed:
    '로그인을 마치지 못했습니다. 쓰시던 내용은 그대로 있으니 다시 게시해보세요.',
  missing_code: '로그인이 취소된 것 같습니다. 다시 게시해보세요.',
};

export default function CreateFlow({
  prompt,
  loggedIn,
  authError,
  initialEulogy,
  initialSource,
  initialSentence,
  alreadyPublished,
}: Props) {
  // 언제나 붙여넣기부터 시작한다.
  //
  // 예전에는 저장된 추도문이 있으면 문장 고르기로 건너뛰었다. 그런데 홈이
  // 자기 묘비가 된 지금, /new에 오는 경로는 '추도문 다시 받아오기'거나
  // 메뉴의 '묘비 만들기'다. 둘 다 새로 붙여넣으려는 사람이다. 건너뛰면
  // 질문(프롬프트)을 볼 기회도 함께 사라진다 — 이 화면에서만 볼 수 있는데.
  //
  // 저장돼 있던 추도문은 그대로 실려 있으니, 고칠 사람은 고치고 새로
  // 받아온 사람은 덮어쓰면 된다.
  const [step, setStep] = useState<Step>('paste');
  const [eulogy, setEulogy] = useState(initialEulogy ?? '');
  const [source, setSource] = useState<EulogySource | null>(initialSource);
  const [sentence, setSentence] = useState(initialSentence ?? '');
  const [customizing, setCustomizing] = useState(false);
  const [error, setError] = useState<string | null>(
    authError ? (AUTH_ERROR_MESSAGES[authError] ?? '로그인에 실패했습니다.') : null,
  );
  const [resuming, setResuming] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

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

        // resuming을 끄지 않는다. 로그인하고 돌아와 이어서 게시한
        // 경우, 끄면 '세우는 중입니다…'가 미리보기로 한 번 돌아갔다가
        // 넘어간다. 켜둔 채로 두면 그대로 /me로 이어진다.

        // 완료 화면을 따로 두지 않는다. "묘비가 세워졌습니다"라고 해놓고
        // 링크 한 줄만 보여주면, 정작 세워진 묘비를 못 본 채 끝난다.
        // 바로 내 묘비로 보낸다 — 공유 링크와 복사는 거기에도 있다.
        //
        // replace인 것은 뒤로 가기로 방금 게시한 미리보기에 돌아오지
        // 않게 하기 위함이다. startTransition 안에서 부르므로 /me가
        // 그려질 때까지 버튼은 '게시 중…'으로 잠겨 있다.
        router.replace('/me');
      });
    },
    [router],
  );

  // 로그인하고 돌아왔을 때의 처리.
  //
  // 성공했다면 로그인 전에 누른 게시를 이어서 마친다 (초안이 있다는 것은
  // 이미 게시를 눌렀다는 뜻이므로 다시 묻지 않는다).
  //
  // 실패했다면 최소한 쓰던 내용은 되살려야 한다. 예전에는 비로그인일 때
  // 초안을 아예 읽지 않아서, 로그인이 깨지면 붙여넣은 글이 통째로
  // 사라진 것처럼 보였다. 실제로는 sessionStorage에 멀쩡히 있었는데도.
  const resumed = useRef(false);
  useEffect(() => {
    if (resumed.current) return;
    resumed.current = true;

    const draft = readDraft();

    // 초안 없이 돌아왔다면 게시하러 간 것이 아니라 로그인만 하러 간
    // 것이다. 콜백은 언제나 여기로 돌아오므로 원래 가려던 곳으로 넘긴다.
    if (!draft) {
      const destination = takeAfterLogin();
      if (destination && loggedIn) router.replace(destination);
      return;
    }

    setEulogy(draft.eulogy);
    setSource(draft.source);
    setSentence(draft.sentence);
    setStep('preview');

    if (!loggedIn) return;

    setResuming(true);
    publish(draft.eulogy, draft.source, draft.sentence);
  }, [loggedIn, publish, router]);

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

    // 도착지를 적어두지 않는다. 초안이 있으니 /new로 돌아와 이어서
    // 게시해야 한다 — 그게 콜백의 기본 도착지인 이유다.
    const result = await signInWithGoogle();
    if (!result.ok) setError(result.error ?? '로그인에 실패했습니다.');
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
      <StepShell
        lead="AI가 돌려준 답을 그대로 붙여넣으세요."
        actions={
          <>
            {error && <p className="text-soul-red text-sm">{error}</p>}
            <button onClick={toSelect} className="rounded-lg">
              다음
            </button>
          </>
        }
      >
        <details className="prompt-details shrink-0">
          <summary>질문을 다시 보기</summary>
          <div className="pt-3">
            <PromptCard prompt={prompt} />
          </div>
        </details>

        <textarea
          value={eulogy}
          onChange={(e) => setEulogy(e.target.value)}
          placeholder="여기에 답변을 붙여넣으세요."
          className="compose-textarea flex-1"
          autoFocus
        />

        <div className="flex flex-wrap gap-2 shrink-0">
          {AI_MODELS.map((s) => (
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
      </StepShell>
    );
  }

  if (step === 'select') {
    return (
      <StepShell
        lead="이 중에서, 묘비에 새길 한 문장을 골라주세요."
        actions={
          <>
            {error && <p className="text-soul-red text-sm">{error}</p>}
            <button
              type="button"
              onClick={() => setCustomizing((v) => !v)}
              className="unpublish-button"
            >
              {customizing ? '목록에서 고르기' : '직접 다듬기'}
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setStep('paste')}
                className="secondary-button"
              >
                이전
              </button>
              <button onClick={toPreview} className="flex-1">
                다음
              </button>
            </div>
          </>
        }
      >
        {customizing ? (
          <>
            <textarea
              value={sentence}
              onChange={(e) => setSentence(e.target.value)}
              maxLength={EPITAPH_MAX}
              className="compose-textarea flex-1"
              autoFocus
            />
            {/* 상한에 닿으면 입력이 그냥 멈춘다. 왜 안 써지는지 보이게 한다. */}
            <p className="compose-count shrink-0">
              {sentence.length}/{EPITAPH_MAX}
            </p>
          </>
        ) : (
          <>
            {sentences.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSentence(s)}
                aria-pressed={sentence === s}
                className="sentence-card shrink-0"
              >
                {s}
              </button>
            ))}
            {sentences.length === 0 && (
              <p className="publish-warning">
                {EPITAPH_MAX}자 안에 들어오는 문장을 찾지 못했습니다. &lsquo;직접
                다듬기&rsquo;로 새길 문장을 적어주세요.
              </p>
            )}
          </>
        )}
      </StepShell>
    );
  }

  // 남은 단계는 미리보기뿐이다. 게시가 끝나면 화면을 더 그리지 않고
  // 곧장 /me로 넘어간다.
  return (
    <StepShell
      lead="이렇게 새겨집니다."
      actions={
        <>
          <p className="publish-warning">
            {alreadyPublished &&
              '이미 세워둔 묘비의 추도문과 각인을 이 내용으로 바꿉니다. '}
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
              {pending
                ? '게시 중…'
                : loggedIn
                  ? '게시하기'
                  : '로그인하고 게시하기'}
            </button>
          </div>
        </>
      }
    >
      <div className="shrink-0">
        <TombstoneSection tombName={sentence} />
      </div>

      <div className="obituary-container shrink-0">
        <p className="eulogy-body">{toPlainText(eulogy)}</p>
      </div>
    </StepShell>
  );
}

/**
 * 한 단계의 틀: 안내문 · 스크롤되는 본문 · 바닥에 붙은 컨트롤.
 *
 * 예전에는 모든 것이 한 흐름에 쌓여 있어서, 문장 후보가 많거나 붙여넣은
 * 추도문이 길면 '이전·다음'과 '직접 다듬기'가 화면 아래로 밀려났다.
 * 다음으로 가려고 스크롤을 한참 내려야 했다.
 *
 * 이제 넘치는 것은 본문 안에서 스크롤되고, 단계를 넘기는 버튼은 언제나
 * 같은 자리에 있다.
 */
function StepShell({
  lead,
  children,
  actions,
}: {
  lead: React.ReactNode;
  children: React.ReactNode;
  actions: React.ReactNode;
}) {
  return (
    <main className="compose-container">
      <p className="compose-lead">{lead}</p>
      <div className="compose-body">{children}</div>
      <div className="compose-actions">{actions}</div>
    </main>
  );
}
