'use client';

import { saveField } from '@/lib/actions';
import { USER_NAME_MAX } from '@/lib/limits';
import EditableText from './EditableText';
import { useLocale } from './LocaleProvider';

export default function UserNameSection({
  userName,
}: {
  userName: string | null;
}) {
  const { t } = useLocale();

  return (
    <div className="username-container text-center">
      <EditableText
        value={userName}
        placeholder={t.userName.placeholder(USER_NAME_MAX)}
        maxLength={USER_NAME_MAX}
        inputClassName="username-input"
        showCount
        countClassName="name-char-count"
        onSave={(value) => saveField('user_name', value)}
      >
        {(name) => (
          <h2 className="text-xl cursor-pointer">
            <span className="block">
              <span className="text-soul-green-500 font-bold underline">
                {name || t.tomb.unidentified}
              </span>
              <span className="text-white">{t.tomb.nameSuffix}</span>
              <span className="block pt-1">{t.tomb.restsHere}</span>
            </span>
          </h2>
        )}
      </EditableText>
    </div>
  );
}
