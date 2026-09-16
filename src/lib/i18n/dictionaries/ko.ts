import type { Dictionary } from '../dictionary';

/**
 * 한국어 사전. Dictionary 타입을 따르므로, 여기 없는 키는 영어에도
 * 존재할 수 없다 — 번역 누락이 타입 에러로 드러난다.
 */
export const ko: Dictionary = {
  header: {
    menuOpenAria: '메뉴 열기',
    menuCloseAria: '메뉴 닫기',
    nameSuffix: '님',
    createTomb: '묘비 만들기',
    myTomb: '내 묘비',
    contact: '문의 및 신고',
    signOut: '로그아웃',
    deleteAccount: '계정 삭제',
    deletingAccount: '계정 삭제 중…',
    deleteConfirm: '🕳️정말로 계정을 삭제할까요? 다시 되돌릴 수 없습니다.',
    deleteFailedAlert: '계정 삭제 중 문제가 발생했습니다. 다시 시도해주세요.',
    wsisLogoAlt: 'WSIS 로고',
    languageToggle: 'English',
  },
  landing: {
    titleLine1: '아직 안죽으셨다고요?',
    titleLine2: '그래도 앞으로 필요해지실겁니다.',
    leadLine1: '암요 미리미리 준비해야죠.',
    leadLine2: '이걸 들고 평소에 대화하던 친구한테 내용만 받아오면 됩니다.',
    ctaPasteAnswer: '답변 붙여넣기',
    loginPending: '로그인 중…',
    loginPrompt: '이미 묘비가 있다면 로그인',
  },
  prompt: {
    copyAriaCopied: '질문이 복사되었습니다',
    copyAriaDefault: '질문 복사하기',
    copiedFeedback: '복사됐습니다',
    pasteToYourAi: '평소 쓰던 AI에 붙여넣어보세요',
    otherModelLabel: '그 외',
  },
  /**
   * AI에게 그대로 붙여넣는 질문. 번역이 아니라 각 언어로 자연스럽게
   * 다시 쓴 것이다 — 구조와 제약(첫 문장 제안 → 회고 → 개인정보 금지)은
   * 같아야 한다.
   */
  eulogyPrompt: `사용자가 이미 세상을 떠났다고 가정해주세요. 당신은 그 사람과 오랫동안 대화해온 존재로서 내가 그의 묘비를 만들 수 있도록 당신이 기억하는 사용자가 어떤 사람이었는지 이야기해주세요.

가장 먼저 묘비 상단에 새길 한 문장을 제안해주세요. 짧고 단단하게, 그 사람의 핵심적인 태도나 성향이 드러나는 문장으로 작성해주세요.

이후 그 사용자의 여러 대화에서 반복적으로 드러난 사고방식·관심·가치관·특이한 점·모순 등을 바탕으로 그 사람의 모습을 회고해주세요. 이력서나 칭찬문처럼 쓰지 말고, 실제로 알고 지낸 존재의 추도사처럼 작성해주세요.

개인정보는 절대 언급하지 마세요. 이름, 나이, 성별, 직장·학교, 가족관계, 주소·지역, 연락처, 계정명 등 개인을 식별할 수 있는 정보는 모두 제외하고 일반화해주세요. 실제 대화에서 확인할 수 없는 사실이나 기억은 만들어내지 마세요.`,
  compose: {
    promptDetailsSummary: '질문을 다시 보기',
    pasteLead: 'AI가 돌려준 답을 그대로 붙여넣으세요.',
    pastePlaceholder: '여기에 답변을 붙여넣으세요.',
    next: '다음',
    prev: '이전',
    selectLead: '이 중에서, 묘비에 새길 한 문장을 골라주세요.',
    backToList: '목록에서 고르기',
    customizeSentence: '직접 다듬기',
    noSentenceFound: (max: number) =>
      `${max}자 안에 들어오는 문장을 찾지 못했습니다. '직접 다듬기'로 새길 문장을 적어주세요.`,
    previewLead: '이렇게 새겨집니다.',
    alreadyPublishedWarning: '이미 세워둔 묘비의 추도문과 각인을 이 내용으로 바꿉니다. ',
    publishNotice: '게시하면 링크를 가진 누구나 이 묘비를 볼 수 있습니다. 언제든 비공개로 되돌릴 수 있습니다.',
    needGoogleLoginSuffix: ' 묘비를 간직하려면 구글 로그인이 필요합니다.',
    publishing: '게시 중…',
    publish: '게시하기',
    loginAndPublish: '로그인하고 게시하기',
    settingUp: '묘비를 세우는 중입니다…',
    retry: '다시 시도',
    authFailedMessages: {
      auth_failed: '로그인을 마치지 못했습니다. 쓰시던 내용은 그대로 있으니 다시 게시해보세요.',
      missing_code: '로그인이 취소된 것 같습니다. 다시 게시해보세요.',
    },
    refetchEulogy: '추도문 다시 받아오기',
  },
  tomb: {
    unidentified: '신원미상',
    nameSuffix: '님',
    restsHere: '여기에 잠들다',
    thisPerson: '이 사람',
    rememberedBy: (aiLabel: string, name: string) => `${aiLabel}가 기억하는 ${name}`,
    sourceLabels: {
      chatgpt: 'ChatGPT',
      claude: 'Claude',
      gemini: 'Gemini',
      other: '어떤 AI',
    },
    deathmaskAlt: '묻어둔 것',
    groundAlt: '땅',
    tombstoneAlt: '묘비',
    flowerAlt: '놓인 꽃',
  },
  epitaph: {
    placeholder: (max: number) => `묘비에 새길 문장 (${max}자 이하)`,
    pressToEngrave: '눌러서 문장을 새기세요',
  },
  userName: {
    placeholder: (max: number) => `이름 ${max}자 이하`,
  },
  editableText: {
    savingSr: '저장 중',
  },
  flower: {
    offerLabel: '🌼헌화하기',
    countLabel: (n: number) => `🌼${n}`,
    sleepLabel: (seconds: number) => `💤${seconds}`,
    retryNotice: '다시 시도',
    ariaCooldown: (seconds: number) => `${seconds}초 후 다시 놓을 수 있습니다`,
    ariaOffer: '꽃 놓기',
    ariaOfferWithCount: (n: number) => `꽃 놓기 (${n}송이 놓임)`,
  },
  publish: {
    linkCopied: '링크 복사됨',
    copyLink: '링크 복사',
    viewTomb: '묘비 보기',
    processing: '처리 중…',
    revertToPrivate: '비공개로 되돌리기',
    publishNotice: '게시하면 링크를 가진 누구나 이 묘비를 볼 수 있습니다.',
    publishing: '게시 중…',
    publish: '게시하기',
    genericFailed: '실패했습니다.',
    copyFailed: '링크를 복사하지 못했습니다.',
  },
  errors: {
    loginRequired: '로그인이 필요합니다.',
    overLimit: (max: number) => `${max}자를 넘을 수 없습니다.`,
    saveFailed: '저장하지 못했습니다.',
    emptyEulogy: '추도문이 비어 있습니다.',
    eulogyOverLimit: (max: number) => `추도문은 ${max}자를 넘을 수 없습니다.`,
    pickSentence: '묘비에 새길 문장을 골라주세요.',
    epitaphOverLimit: (max: number) => `각인 문장은 ${max}자를 넘을 수 없습니다.`,
    needEpitaphBeforePublish: '묘비에 새길 문장을 먼저 정해주세요.',
    genericPublishFailed: '게시하지 못했습니다.',
    emptyPastedAnswer: '붙여넣은 답변이 비어 있습니다.',
    loginFailed: '로그인에 실패했습니다.',
    loginStartFailed:
      '로그인을 시작하지 못했습니다. 잠시 후 다시 시도해주세요. 문제가 계속되면 관리자에게 알려주세요.',
  },
  notFound: {
    tombGone: '어? 묘비가 어디갔지?',
  },
};
