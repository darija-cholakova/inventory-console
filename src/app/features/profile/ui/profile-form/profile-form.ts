import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  output,
  signal,
} from '@angular/core';
import { FormField, FormRoot, form } from '@angular/forms/signals';
import { MatButton } from '@angular/material/button';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';

import { Banner } from '../../../../shared/ui/banner/banner';
import { FormErrorSummary } from '../../../../shared/ui/form-error-summary/form-error-summary';

import {
  ProfileFormModel,
  FormErrorItem,
  SummaryField,
  UserProfile,
} from '../../../../shared/models/interfaces';
import { ProfileEdits } from '../../data-access/profile-edits';
import { profileFormSchema } from '../../utils/profile-form.schema';

const EMPTY_FORM: ProfileFormModel = { firstName: '', lastName: '', phone: '', jobTitle: '' };

/** Profile edit form; same validation UX as the product form (errors after the first save). */
@Component({
  selector: 'app-profile-form',
  imports: [
    FormRoot,
    FormField,
    MatFormField,
    MatLabel,
    MatError,
    MatInput,
    MatButton,
    MatProgressSpinner,
    Banner,
    FormErrorSummary,
  ],
  templateUrl: './profile-form.html',
  styleUrl: './profile-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileForm {
  private readonly edits = inject(ProfileEdits);

  /** Not input.required: form() reads the model while the component is constructed. */
  readonly profile = input<UserProfile>();

  readonly saved = output<void>();
  readonly cancelled = output<void>();

  private readonly model = linkedSignal<ProfileFormModel>(() => {
    const p = this.profile();
    return p
      ? { firstName: p.firstName, lastName: p.lastName, phone: p.phone, jobTitle: p.company.title }
      : EMPTY_FORM;
  });

  protected readonly profileForm = form(this.model, profileFormSchema, {
    submission: {
      action: (field) => this.save(field().value()),
      onInvalid: () => {
        this.attempted.set(true);
        this.firstInvalid()?.field().focusBoundControl();
      },
    },
  });

  protected readonly attempted = signal(false);
  protected readonly saveFailed = signal(false);
  private isSaved = false;

  protected readonly matcher: ErrorStateMatcher = {
    isErrorState: () => false,
    isSignalErrorState: (field) => !!field && this.attempted() && field().invalid(),
  };

  private readonly summaryFields: SummaryField[] = [
    { id: 'profile-first-name', field: this.profileForm.firstName },
    { id: 'profile-last-name', field: this.profileForm.lastName },
    { id: 'profile-phone', field: this.profileForm.phone },
    { id: 'profile-job-title', field: this.profileForm.jobTitle },
  ];

  protected readonly summary = computed<FormErrorItem[]>(() =>
    this.summaryFields
      .filter(({ field }) => field().invalid())
      .map(({ id, field }) => ({
        id,
        message: field().errors()[0]?.message ?? '',
        focus: () => field().focusBoundControl(),
      })),
  );

  hasUnsavedChanges(): boolean {
    return !this.isSaved && this.profileForm().dirty();
  }

  private firstInvalid(): SummaryField | undefined {
    return this.summaryFields.find(({ field }) => field().invalid());
  }

  private async save(value: ProfileFormModel): Promise<undefined> {
    const profile = this.profile();
    if (!profile) return undefined;
    this.saveFailed.set(false);
    try {
      await firstValueFrom(
        this.edits.update(profile.id, {
          firstName: value.firstName.trim(),
          lastName: value.lastName.trim(),
          phone: value.phone.trim(),
          jobTitle: value.jobTitle.trim(),
        }),
      );
    } catch {
      this.saveFailed.set(true);
      return undefined;
    }
    this.isSaved = true;
    this.saved.emit();
    return undefined;
  }
}
