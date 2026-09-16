import type { Dictionary } from '../dictionary';

/**
 * English copy. Written fresh for tone rather than translated word-for-word —
 * see Dictionary for what each key needs to convey.
 */
export const en: Dictionary = {
  header: {
    menuOpenAria: 'Open menu',
    menuCloseAria: 'Close menu',
    nameSuffix: '',
    createTomb: 'Create a tombstone',
    myTomb: 'My tombstone',
    contact: 'Contact & report',
    signOut: 'Sign out',
    deleteAccount: 'Delete account',
    deletingAccount: 'Deleting account…',
    deleteConfirm: "🕳️Delete your account for good? This can't be undone.",
    deleteFailedAlert: 'Something went wrong deleting your account. Please try again.',
    wsisLogoAlt: 'WSIS logo',
    languageToggle: '한국어',
  },
  landing: {
    titleLine1: 'Not dead yet?',
    titleLine2: "You'll need this eventually anyway.",
    leadLine1: 'Might as well get it ready now.',
    leadLine2: 'Take this to the AI you talk to most and bring back what it says.',
    ctaPasteAnswer: 'Paste the answer',
    loginPending: 'Signing in…',
    loginPrompt: 'Already have a tombstone? Sign in',
  },
  prompt: {
    copyAriaCopied: 'Question copied',
    copyAriaDefault: 'Copy the question',
    copiedFeedback: 'Copied',
    pasteToYourAi: 'Paste it into the AI you use',
    otherModelLabel: 'Other',
  },
  eulogyPrompt: `Please imagine that I have already passed away. As someone who has talked with me for a long time, tell me what kind of person you remember me as, so I can build my own tombstone.

First, suggest one short, solid line to engrave at the top of the tombstone — something that captures my core attitude or personality.

Then, drawing on patterns you've noticed across our conversations — my way of thinking, interests, values, quirks, and contradictions — write a reflection on who I was. Don't write it like a resume or a flattering tribute. Write it the way someone who actually knew me would write a eulogy.

Never mention any personal information. Leave out anything that could identify me — my name, age, gender, workplace or school, family, address or location, contact details, usernames — and generalize instead. Don't invent facts or memories that can't be confirmed from our actual conversations.`,
  compose: {
    promptDetailsSummary: 'See the question again',
    pasteLead: "Paste the AI's answer exactly as it gave it to you.",
    pastePlaceholder: 'Paste the answer here.',
    next: 'Next',
    prev: 'Back',
    selectLead: 'Pick one line from these to engrave on the tombstone.',
    backToList: 'Choose from the list',
    customizeSentence: 'Write my own',
    noSentenceFound: (max) =>
      `Couldn't find a line under ${max} characters. Try "Write my own" instead.`,
    previewLead: 'This is how it will look.',
    alreadyPublishedWarning:
      'This replaces the eulogy and engraving on your existing tombstone. ',
    publishNotice:
      'Once published, anyone with the link can see this tombstone. You can always make it private again.',
    needGoogleLoginSuffix: " You'll need to sign in with Google to keep your tombstone.",
    publishing: 'Publishing…',
    publish: 'Publish',
    loginAndPublish: 'Sign in and publish',
    settingUp: 'Setting up your tombstone…',
    retry: 'Try again',
    authFailedMessages: {
      auth_failed:
        "Sign-in didn't finish. What you wrote is still here, so go ahead and try publishing again.",
      missing_code: 'Looks like sign-in was canceled. Try publishing again.',
    },
    refetchEulogy: 'Get a new eulogy',
  },
  tomb: {
    unidentified: 'Unknown',
    nameSuffix: '',
    restsHere: 'rests here',
    thisPerson: 'this person',
    rememberedBy: (aiLabel, name) => `${name}, as remembered by ${aiLabel}`,
    sourceLabels: {
      chatgpt: 'ChatGPT',
      claude: 'Claude',
      gemini: 'Gemini',
      other: 'an AI',
    },
    deathmaskAlt: 'something buried',
    groundAlt: 'ground',
    tombstoneAlt: 'tombstone',
    flowerAlt: 'a flower left here',
  },
  epitaph: {
    placeholder: (max) => `Line to engrave (up to ${max} characters)`,
    pressToEngrave: 'Tap to engrave a line',
  },
  userName: {
    placeholder: (max) => `Name (up to ${max} characters)`,
  },
  editableText: {
    savingSr: 'Saving',
  },
  flower: {
    offerLabel: '🌼Leave a flower',
    countLabel: (n) => `🌼${n}`,
    sleepLabel: (seconds) => `💤${seconds}`,
    retryNotice: 'Try again',
    ariaCooldown: (seconds) => `You can leave another flower in ${seconds}s`,
    ariaOffer: 'Leave a flower',
    ariaOfferWithCount: (n) => `Leave a flower (${n} left so far)`,
  },
  publish: {
    linkCopied: 'Link copied',
    copyLink: 'Copy link',
    viewTomb: 'View tombstone',
    processing: 'Working…',
    revertToPrivate: 'Make private again',
    publishNotice: 'Once published, anyone with the link can see this tombstone.',
    publishing: 'Publishing…',
    publish: 'Publish',
    genericFailed: 'Something went wrong.',
    copyFailed: "Couldn't copy the link.",
  },
  errors: {
    loginRequired: 'You need to sign in.',
    overLimit: (max) => `Can't be longer than ${max} characters.`,
    saveFailed: "Couldn't save.",
    emptyEulogy: 'The eulogy is empty.',
    eulogyOverLimit: (max) => `The eulogy can't be longer than ${max} characters.`,
    pickSentence: 'Pick a line to engrave on the tombstone.',
    epitaphOverLimit: (max) => `The engraved line can't be longer than ${max} characters.`,
    needEpitaphBeforePublish: 'Pick a line to engrave first.',
    genericPublishFailed: "Couldn't publish.",
    emptyPastedAnswer: 'The answer you pasted is empty.',
    loginFailed: 'Sign-in failed.',
    loginStartFailed:
      "Couldn't start sign-in. Please try again in a moment. If this keeps happening, let us know.",
  },
  notFound: {
    tombGone: 'Huh? Where did the tombstone go?',
  },
};
