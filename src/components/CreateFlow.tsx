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
import { useLocale } from './LocaleProvider';

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
  const { t } = useLocale();
  const [step, setStep] = useState<Step>('paste');
  const [eulogy, setEulogy] = useState(initialEulogy ?? '');
  const [source, setSource] = useState<EulogySource | null>(initialSource);
  const [sentence, setSentence] = useState(initialSentence ?? '');
  const [customizing, setCustomizing] = useState(false);
  const [error, setError] = useState<string | null>(
    authError
      ? (t.compose.authFailedMessages[
          authError as keyof typeof t.compose.authFailedMessages
        ] ?? t.errors.loginFailed)
      : null,
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
          setError(saved.error ?? t.errors.saveFailed);
          setResuming(false);
          return;
        }

        const result = await setPublished(true);
        if (!result.ok) {
          setError(result.error ?? t.errors.genericPublishFailed);
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
    [router, t],
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

    // sessionStorage(외부 저장소)에서 마운트 시 한 번만 복원하는 것이라
    // "prop이 바뀌면 state를 되돌린다" 안티패턴과는 다르다. resumed ref로
    // 이미 한 번만 실행되게 막아뒀다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
      setError(t.errors.emptyPastedAnswer);
      return;
    }
    setError(null);
    setStep('select');
  };

  const toPreview = () => {
    if (!sentence.trim()) {
      setError(t.errors.pickSentence);
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
    const result = await signInWithGoogle(undefined, t.errors.loginStartFailed);
    if (!result.ok) setError(result.error ?? t.errors.loginFailed);
  };

  if (resuming) {
    return (
      <main className="compose-container">
        <p className="compose-lead">{t.compose.settingUp}</p>
        {error && (
          <>
            <p className="text-soul-red text-sm">{error}</p>
            <button onClick={() => publish(eulogy, source, sentence)}>
              {t.compose.retry}
            </button>
          </>
        )}
      </main>
    );
  }

  if (step === 'paste') {
    return (
      <StepShell
        lead={t.compose.pasteLead}
        actions={
          <>
            {error && <p className="text-soul-red text-sm">{error}</p>}
            <button onClick={toSelect} className="rounded-lg">
              {t.compose.next}
            </button>
          </>
        }
      >
        <details className="prompt-details shrink-0">
          <summary>{t.compose.promptDetailsSummary}</summary>
          <div className="pt-3">
            <PromptCard prompt={prompt} />
          </div>
        </details>

        <textarea
          value={eulogy}
          onChange={(e) => setEulogy(e.target.value)}
          placeholder={t.compose.pastePlaceholder}
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
              {s.value === 'other' ? t.prompt.otherModelLabel : s.label}
            </button>
          ))}
        </div>
      </StepShell>
    );
  }

  if (step === 'select') {
    return (
      <StepShell
        lead={t.compose.selectLead}
        actions={
          <>
            {error && <p className="text-soul-red text-sm">{error}</p>}
            <button
              type="button"
              onClick={() => setCustomizing((v) => !v)}
              className="unpublish-button"
            >
              {customizing ? t.compose.backToList : t.compose.customizeSentence}
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setStep('paste')}
                className="secondary-button"
              >
                {t.compose.prev}
              </button>
              <button onClick={toPreview} className="flex-1">
                {t.compose.next}
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
                {t.compose.noSentenceFound(EPITAPH_MAX)}
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
      lead={t.compose.previewLead}
      actions={
        <>
          <p className="publish-warning">
            {alreadyPublished && t.compose.alreadyPublishedWarning}
            {t.compose.publishNotice}
            {!loggedIn && t.compose.needGoogleLoginSuffix}
          </p>

          {error && <p className="text-soul-red text-sm">{error}</p>}

          <div className="flex gap-2">
            <button
              onClick={() => setStep('select')}
              className="secondary-button"
              disabled={pending}
            >
              {t.compose.prev}
            </button>
            <button onClick={onPublish} className="flex-1" disabled={pending}>
              {pending
                ? t.compose.publishing
                : loggedIn
                  ? t.compose.publish
                  : t.compose.loginAndPublish}
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
