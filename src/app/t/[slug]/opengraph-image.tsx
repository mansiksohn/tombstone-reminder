import { ImageResponse } from 'next/og';
import { getPublishedTomb, siteUrl } from '@/lib/tomb';

export const alt = '묘비log에 세워진 묘비';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// 묘비 내용은 언제든 바뀔 수 있으므로 미리 굽지 않는다.
export const dynamic = 'force-dynamic';

/**
 * 공유 링크에 붙는 카드 이미지.
 *
 * 이 제품의 확산 경로는 링크 공유 하나뿐인데, 지금까지 카톡·트위터에는
 * 아무 그림도 뜨지 않거나 전 묘비가 똑같은 기본 이미지를 달고 나갔다.
 * 각인된 문장이 보이지 않으면 링크를 누를 이유도 없다.
 *
 * 묘비 SVG는 838바이트짜리 path 두 개라 파일을 읽거나 받아올 것 없이
 * 그대로 그린다. 런타임에 실패할 구석을 하나 줄이는 편이 낫다.
 */
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tomb = await getPublishedTomb(slug);

  // 초안이거나 없는 slug. 크롤러에게는 기본 카드를 준다.
  if (!tomb) return fallbackCard();

  // 이름은 24자, 각인은 200자까지 들어올 수 있다. 카드는 스치듯 보는
  // 물건이라 둘 다 그 길이로는 읽히지 않고, 넘치면 판을 무너뜨린다.
  const name = clamp(tomb.user_name?.trim() || '신원미상', 12);
  const engraved = clamp(tomb.tomb_name?.trim() ?? '', 130);
  const credit = tomb.eulogy_source
    ? `${sourceLabel(tomb.eulogy_source)}가 기억하는 ${name}`
    : '';

  // 한글은 내장 폰트로 그려지지 않는다. 쓰이는 글자만 잘라 받는다.
  const fonts = await loadFonts([name, engraved, credit].join(''));
  if (!fonts) return fallbackCard();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#000000',
          // 묘비 뒤에서 올라오는 옅은 빛. 완전한 검정 위에 검은 돌을
          // 얹으면 형태가 사라진다.
          backgroundImage:
            'radial-gradient(circle at 22% 58%, rgba(0, 220, 130, 0.13), rgba(0, 0, 0, 0) 55%)',
          padding: '0 72px',
          fontFamily: 'Noto Sans KR',
        }}
      >
        <Headstone text={engraved} />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            marginLeft: 64,
            flex: 1,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span
              style={{
                fontSize: nameSize(name.length),
                fontWeight: 700,
                color: '#00dc82',
              }}
            >
              {name}
            </span>
            <span
              style={{
                fontSize: Math.round(nameSize(name.length) * 0.72),
                color: '#ffffff',
                marginLeft: 4,
              }}
            >
              님
            </span>
          </div>
          <span style={{ fontSize: 44, color: '#ffffff', marginTop: 8 }}>
            여기에 잠들다
          </span>

          <div
            style={{
              width: 88,
              height: 3,
              backgroundColor: '#146858',
              margin: '36px 0',
            }}
          />

          {credit && (
            <span style={{ fontSize: 27, color: '#999999' }}>{credit}</span>
          )}
          <span style={{ fontSize: 27, color: '#666666', marginTop: 12 }}>
            묘비에 꽃을 놓아주세요
          </span>
        </div>

        <span
          style={{
            position: 'absolute',
            right: 72,
            bottom: 52,
            fontSize: 26,
            fontWeight: 700,
            color: '#00dc82',
          }}
        >
          묘비log
        </span>
      </div>
    ),
    { ...size, fonts },
  );
}

/**
 * 묘비와 그 위에 각인된 문장.
 *
 * 문장은 최대 200자까지 들어올 수 있다. 한 크기로 고정하면 짧은 문장은
 * 돌 한가운데 점처럼 남고 긴 문장은 돌 밖으로 흘러넘친다.
 */
function Headstone({ text }: { text: string }) {
  const width = 330;
  const height = 505; // 366 × 560의 비율 그대로

  return (
    <div style={{ display: 'flex', position: 'relative', width, height }}>
      <svg width={width} height={height} viewBox="0 0 366 560" fill="none">
        <path
          d="M280.717 68.5714C275.513 68.5714 271.039 65.0099 269.256 60.1107C256.495 25.0404 222.916 0 183.5 0C144.084 0 110.505 25.0404 97.7439 60.1107C95.9612 65.0099 91.487 68.5714 86.2825 68.5714H46.625C21.427 68.5714 1 89.0384 1 114.286V560H366V114.286C366 89.0384 345.573 68.5714 320.375 68.5714H280.717Z"
          fill="#111111"
        />
        <path
          d="M18.4545 539.023V121.475C18.4545 102.201 34.335 86.5769 53.9246 86.5769H97.0412C105.878 86.5769 112.85 79.3145 114.881 70.7146C122.181 39.8096 150.348 16.7815 183.981 16.7815C217.615 16.7815 245.781 39.8096 253.081 70.7146C255.113 79.3145 262.085 86.5769 270.921 86.5769H314.038C333.628 86.5769 349.508 102.201 349.508 121.475V539.023"
          stroke="#00dc82"
          strokeWidth={4}
          strokeLinecap="round"
        />
      </svg>

      <div
        style={{
          position: 'absolute',
          top: 108,
          left: 34,
          width: width - 68,
          height: height - 160,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          // 어떤 문장이 와도 돌 밖으로는 나가지 않는다.
          overflow: 'hidden',
        }}
      >
        <span
          style={{
            fontSize: engravingSize(text.length),
            fontWeight: 700,
            color: '#00dc82',
            lineHeight: 1.55,
            wordBreak: breakMode(text),
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
}

/**
 * 한국어는 어절 중간에서 끊지 않는 편이 훨씬 잘 읽힌다. 다만 띄어쓰기
 * 없이 길게 이어붙인 문장에는 끊을 자리가 아예 없어서, keep-all로 두면
 * 한 줄이 돌을 뚫고 카드 밖까지 뻗어나간다. 그런 문장에만 물러선다.
 */
function breakMode(text: string): 'keep-all' | 'break-word' {
  const longest = Math.max(...text.split(/\s+/).map((token) => token.length), 0);
  return longest > 14 ? 'break-word' : 'keep-all';
}

function nameSize(length: number) {
  return length <= 8 ? 56 : 44;
}

/** 넘치면 자르고 말줄임표를 붙인다. */
function clamp(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

function engravingSize(length: number) {
  if (length <= 24) return 34;
  if (length <= 48) return 28;
  if (length <= 90) return 23;
  return 19;
}

function sourceLabel(source: string) {
  return (
    { chatgpt: 'ChatGPT', claude: 'Claude', gemini: 'Gemini', other: '어떤 AI' }[
      source
    ] ?? '어떤 AI'
  );
}

/**
 * 쓰이는 글자만 담은 Noto Sans KR를 받아온다.
 *
 * 한글 전체를 담은 폰트는 수 MB라 함수에 싣기 부담스럽다. Google Fonts는
 * `text=`로 요청하면 그 글자들만 든 폰트를 돌려주는데, 보통 몇 KB다.
 *
 * User-Agent가 필요한 이유: 최신 브라우저로 보이면 woff2를 주는데
 * satori는 이걸 읽지 못한다. 옛 UA를 보내야 truetype이 온다.
 */
async function loadFonts(text: string) {
  try {
    const [regular, bold] = await Promise.all([
      loadFont(text, 400),
      loadFont(text, 700),
    ]);
    return [
      { name: 'Noto Sans KR', data: regular, weight: 400 as const, style: 'normal' as const },
      { name: 'Noto Sans KR', data: bold, weight: 700 as const, style: 'normal' as const },
    ];
  } catch (error) {
    console.error(
      'OG 폰트를 받지 못했습니다:',
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

async function loadFont(text: string, weight: number) {
  // 고정 문구는 어느 묘비에나 들어가므로 항상 함께 요청한다.
  const chars = Array.from(new Set(text + '님여기에잠들다묘비log꽃을놓아주세요신원미상')).join('');
  const url =
    `https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@${weight}` +
    `&text=${encodeURIComponent(chars)}`;

  const css = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.116 Safari/537.36',
    },
  }).then((res) => res.text());

  const src = css.match(/src:\s*url\((https:\/\/[^)]+)\)/);
  if (!src) throw new Error(`css2 응답에서 폰트 URL을 찾지 못했습니다 (weight ${weight})`);

  const res = await fetch(src[1]);
  if (!res.ok) throw new Error(`폰트 파일 응답 ${res.status} (weight ${weight})`);
  return res.arrayBuffer();
}

/**
 * 묘비를 못 그렸을 때. 크롤러에게 아무것도 주지 않으면 링크가 민둥해지므로
 * 사이트 기본 카드로 넘긴다.
 */
function fallbackCard() {
  return Response.redirect(`${siteUrl()}/og-image.png`, 302);
}
