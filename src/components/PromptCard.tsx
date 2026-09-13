'use client';

import { useState } from 'react';
import { LINKABLE_MODELS } from '@/lib/models';

export default function PromptCard({ prompt }: { prompt: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 클립보드가 막힌 환경에서는 직접 긁어서 복사하면 된다.
    }
  };

  return (
    <div className="prompt-block">
      {/*
        복사는 이 카드에서 할 수 있는 유일한 일이다. 그런데 예전에는
        바로 아래 '질문 복사하기' 버튼이 '답변 붙여넣기'와 나란히
        굵은 초록 버튼이라, CTA가 둘로 보였다. 카드 자체를 클릭 영역으로
        삼고 아이콘 하나만 얹어 복사는 보조 동작임을 드러낸다.
      */}
      <div className="prompt-card-wrap">
        <blockquote
          className="prompt-card"
          role="button"
          tabIndex={0}
          onClick={copy}
          onKeyDown={(e) => {
            if (e.key !== 'Enter' && e.key !== ' ') return;
            e.preventDefault();
            copy();
          }}
          aria-label={copied ? '질문이 복사되었습니다' : '질문 복사하기'}
        >
          {prompt}
        </blockquote>

        <span className="prompt-copy-icon" aria-hidden="true">
          {copied ? <CheckIcon /> : <CopyIcon />}
        </span>

        <span className={`prompt-copy-feedback${copied ? ' is-visible' : ''}`} aria-hidden="true">
          복사됐습니다
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <p className="model-links-lead">복사하면서 바로 열기</p>
        <div className="flex gap-2">
          {LINKABLE_MODELS.map((model) => (
            // <a>를 쓰는 이유: 복사를 await한 뒤 window.open을 부르면
            // 모바일 사파리가 사용자 제스처가 끊겼다고 보고 팝업을 막는다.
            // 링크 클릭 자체가 새 탭을 열고, 복사는 그 옆에서 일어난다.
            //
            // 새 탭이라 이 페이지는 그대로 남으므로 복사도 끝까지 간다.
            <a
              key={model.value}
              href={model.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={copy}
              className="model-link"
            >
              {model.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
