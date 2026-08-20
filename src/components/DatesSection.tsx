'use client';

import { useState, useTransition } from 'react';
import { saveField } from '@/lib/actions';

interface Props {
  birthDate: string | null;
  deathDate: string | null;
  editable?: boolean;
}

function DateField({
  value,
  field,
}: {
  value: string | null;
  field: 'birth_date' | 'death_date';
}) {
  const [editing, setEditing] = useState(false);
  const [, startTransition] = useTransition();

  if (!editing) {
    return (
      <span
        onClick={() => setEditing(true)}
        className="date-input cursor-pointer underline"
      >
        {value || '????'}
      </span>
    );
  }

  return (
    <input
      type="date"
      defaultValue={value ?? ''}
      autoFocus
      className="border p-2 rounded-l text-black"
      onBlur={(e) => {
        setEditing(false);
        startTransition(() => {
          void saveField(field, e.target.value || null);
        });
      }}
    />
  );
}

export default function DatesSection({
  birthDate,
  deathDate,
  editable = true,
}: Props) {
  return (
    <div className="date-container flex flex-col items-center">
      <div className="flex items-center">
        {editable ? (
          <DateField value={birthDate} field="birth_date" />
        ) : (
          <span className="date-input text-white">{birthDate || '????'}</span>
        )}
        <span className="date-separator mx-2 text-soul-green-500"> ~ </span>
        {editable ? (
          <DateField value={deathDate} field="death_date" />
        ) : (
          <span className="date-input text-white">{deathDate || '????'}</span>
        )}
      </div>
    </div>
  );
}
