import { pattern, required, schema, validate } from '@angular/forms/signals';

import { ProfileFormModel } from '../../../shared/models/interfaces';

const blank = (value: string) => value.trim() === '';

/** Digits, spaces and + - ( ), at least 6 digits, e.g. "+81 965-431-3024". */
const PHONE = /^\+?[\d\s()-]*$/;

// Messages are translation keys; the template and the error summary translate them.
export const profileFormSchema = schema<ProfileFormModel>((p) => {
  required(p.firstName, { message: 'validation.error.firstNameRequired' });
  validate(p.firstName, ({ value }) =>
    value() && blank(value())
      ? { kind: 'blank', message: 'validation.error.firstNameRequired' }
      : null,
  );
  required(p.lastName, { message: 'validation.error.lastNameRequired' });
  validate(p.lastName, ({ value }) =>
    value() && blank(value())
      ? { kind: 'blank', message: 'validation.error.lastNameRequired' }
      : null,
  );
  required(p.phone, { message: 'validation.error.phoneRequired' });
  pattern(p.phone, PHONE, { message: 'validation.error.phoneFormat' });
  validate(p.phone, ({ value }) =>
    value() && PHONE.test(value()) && value().replace(/\D/g, '').length < 6
      ? { kind: 'short', message: 'validation.error.phoneDigits' }
      : null,
  );
  required(p.jobTitle, { message: 'validation.error.jobTitleRequired' });
  validate(p.jobTitle, ({ value }) =>
    value() && blank(value())
      ? { kind: 'blank', message: 'validation.error.jobTitleRequired' }
      : null,
  );
});
