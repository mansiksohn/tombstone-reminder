'use client';

import { saveField } from '@/lib/actions';
import { USER_NAME_MAX } from '@/lib/limits';
import EditableText from './EditableText';

export default function UserNameSection({
  userName,
}: {
  userName: string | null;
}) {
  return (
    <div className="username-container text-center">
      <EditableText
        value={userName}
        placeholder={`이름 ${USER_NAME_MAX}자 이하`}
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
                {name || '신원미상'}
              </span>
              <span className="text-white">님</span>
              <span className="block pt-1">여기에 잠들다</span>
            </span>
          </h2>
        )}
      </EditableText>
    </div>
  );
}
