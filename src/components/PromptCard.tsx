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
      <blockquote className="prompt-card">{prompt}</blockquote>

      <button onClick={copy} className="rounded-lg">
        {copied ? '복사됐습니다' : '질문 복사하기'}
      </button>

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
