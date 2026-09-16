/**
 * 두 언어 사전이 공통으로 따라야 하는 모양.
 *
 * ko.ts를 기준으로 typeof를 뽑지 않는 이유: 문자열 리터럴 값 자체가
 * 타입이 되어(예: next: '다음'이 타입 '다음'이 되어) en.ts가 그 값을
 * 그대로 가져야만 하는 상황이 된다. 인터페이스를 따로 두고 양쪽이
 * 이걸 구현하게 하면, 값은 자유롭고 키 누락만 타입 에러로 잡힌다.
 */
export interface Dictionary {
  header: {
    menuOpenAria: string;
    menuCloseAria: string;
    nameSuffix: string;
    createTomb: string;
    myTomb: string;
    contact: string;
    signOut: string;
    deleteAccount: string;
    deletingAccount: string;
    deleteConfirm: string;
    deleteFailedAlert: string;
    wsisLogoAlt: string;
    /** 버튼에 적힐, "지금과 다른" 언어의 이름 (누르면 그 언어로 바뀐다). */
    languageToggle: string;
  };
  landing: {
    titleLine1: string;
    titleLine2: string;
    leadLine1: string;
    leadLine2: string;
    ctaPasteAnswer: string;
    loginPending: string;
    loginPrompt: string;
  };
  prompt: {
    copyAriaCopied: string;
    copyAriaDefault: string;
    copiedFeedback: string;
    pasteToYourAi: string;
    otherModelLabel: string;
  };
  /** AI에게 그대로 붙여넣는 질문 전문. */
  eulogyPrompt: string;
  compose: {
    promptDetailsSummary: string;
    pasteLead: string;
    pastePlaceholder: string;
    next: string;
    prev: string;
    selectLead: string;
    backToList: string;
    customizeSentence: string;
    noSentenceFound: (max: number) => string;
    previewLead: string;
    alreadyPublishedWarning: string;
    publishNotice: string;
    needGoogleLoginSuffix: string;
    publishing: string;
    publish: string;
    loginAndPublish: string;
    settingUp: string;
    retry: string;
    authFailedMessages: {
      auth_failed: string;
      missing_code: string;
    };
    refetchEulogy: string;
  };
  tomb: {
    unidentified: string;
    nameSuffix: string;
    restsHere: string;
    thisPerson: string;
    rememberedBy: (aiLabel: string, name: string) => string;
    sourceLabels: {
      chatgpt: string;
      claude: string;
      gemini: string;
      other: string;
    };
    deathmaskAlt: string;
    groundAlt: string;
    tombstoneAlt: string;
    flowerAlt: string;
  };
  epitaph: {
    placeholder: (max: number) => string;
    pressToEngrave: string;
  };
  userName: {
    placeholder: (max: number) => string;
  };
  editableText: {
    savingSr: string;
  };
  flower: {
    offerLabel: string;
    countLabel: (n: number) => string;
    sleepLabel: (seconds: number) => string;
    retryNotice: string;
    ariaCooldown: (seconds: number) => string;
    ariaOffer: string;
    ariaOfferWithCount: (n: number) => string;
  };
  publish: {
    linkCopied: string;
    copyLink: string;
    viewTomb: string;
    processing: string;
    revertToPrivate: string;
    publishNotice: string;
    publishing: string;
    publish: string;
    genericFailed: string;
    copyFailed: string;
  };
  errors: {
    loginRequired: string;
    overLimit: (max: number) => string;
    saveFailed: string;
    emptyEulogy: string;
    eulogyOverLimit: (max: number) => string;
    pickSentence: string;
    epitaphOverLimit: (max: number) => string;
    needEpitaphBeforePublish: string;
    genericPublishFailed: string;
    emptyPastedAnswer: string;
    loginFailed: string;
    loginStartFailed: string;
  };
  notFound: {
    tombGone: string;
  };
}
