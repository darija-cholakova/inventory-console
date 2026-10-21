import { pattern, required, schema, validate } from '@angular/forms/signals';

import { ProfileFormModel } from '../../../shared/models/interfaces';

const blank = (value: string) => value.trim() === '';

/** Digits, spaces and + - ( ), at least 6 digits, e.g. "+81 965-431-3024". */
const PHONE = /^\+?[\d\s()-]*$/;

export const profileFormSchema = schema<ProfileFormModel>((p) => {
  required(p.firstName, { message: 'First name is required.' });
  validate(p.firstName, ({ value }) =>
    value() && blank(value()) ? { kind: 'blank', message: 'First name is required.' } : null,
  );
  required(p.lastName, { message: 'Last name is required.' });
  validate(p.lastName, ({ value }) =>
    value() && blank(value()) ? { kind: 'blank', message: 'Last name is required.' } : null,
  );
  required(p.phone, { message: 'Phone is required.' });
  pattern(p.phone, PHONE, { message: 'Use digits, spaces and + - ( ) only.' });
  validate(p.phone, ({ value }) =>
    value() && PHONE.test(value()) && value().replace(/\D/g, '').length < 6
      ? { kind: 'short', message: 'Enter at least 6 digits.' }
      : null,
  );
  required(p.jobTitle, { message: 'Job title is required.' });
  validate(p.jobTitle, ({ value }) =>
    value() && blank(value()) ? { kind: 'blank', message: 'Job title is required.' } : null,
  );
});
