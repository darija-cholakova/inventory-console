import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatError, MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';

import { AuthService } from '../../../../core/auth/auth.service';
import { LoginErrorKind } from '../../../../core/auth/models/auth.model';
import { safeReturnUrl } from '../../../../core/auth/return-url';

const ERROR_MESSAGES: Record<LoginErrorKind, string> = {
  'invalid-credentials': 'Incorrect username or password. Check both and try again.',
  network: 'A network issue occurred. Please try again later.',
  unknown: 'Something went wrong. Please try again.',
};

@Component({
  selector: 'app-login-page',
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatError,
    MatSuffix,
    MatInput,
    MatIcon,
    MatButton,
    MatIconButton,
    MatProgressSpinner,
  ],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /** Query params, bound through withComponentInputBinding(). */
  readonly returnUrl = input<string>();
  readonly reason = input<string>();

  protected readonly form = inject(NonNullableFormBuilder).group({
    // pattern(/\S/) also rejects a username made of spaces only
    username: ['', [Validators.required, Validators.pattern(/\S/)]],
    password: ['', Validators.required],
  });

  /**
   * Field errors appear only after a sign-in attempt (validation on submit) and are hidden again
   * after a failed sign-in, so the cleared password is not flagged next to the error banner.
   */
  private readonly showFieldErrors = signal(false);
  protected readonly errorStateMatcher: ErrorStateMatcher = {
    isErrorState: (control) => !!control?.invalid && this.showFieldErrors(),
  };

  protected readonly submitting = signal(false);
  protected readonly passwordVisible = signal(false);
  private readonly errorKind = signal<LoginErrorKind | null>(null);

  protected readonly errorMessage = computed(() => {
    const kind = this.errorKind();
    return kind ? ERROR_MESSAGES[kind] : null;
  });
  /** The "session expired" note disappears as soon as the user tries again. */
  protected readonly sessionExpired = computed(
    () => this.reason() === 'expired' && !this.errorKind(),
  );

  private readonly usernameInput =
    viewChild.required<ElementRef<HTMLInputElement>>('usernameInput');
  private readonly passwordInput =
    viewChild.required<ElementRef<HTMLInputElement>>('passwordInput');

  protected dismissError(): void {
    this.errorKind.set(null);
  }

  protected togglePasswordVisibility(): void {
    this.passwordVisible.update((visible) => !visible);
  }

  protected submit(): void {
    if (this.submitting()) return;

    if (this.form.invalid) {
      this.showFieldErrors.set(true);
      this.focusFirstInvalidField();
      return;
    }

    this.errorKind.set(null);
    this.submitting.set(true);
    this.form.disable();

    const { username, password } = this.form.getRawValue();
    // Trim the username only: spaces can be part of a password.
    this.auth.login({ username: username.trim(), password }).subscribe({
      next: () => {
        void this.router.navigateByUrl(safeReturnUrl(this.returnUrl()), { replaceUrl: true });
      },
      error: (kind: LoginErrorKind) => {
        this.submitting.set(false);
        this.form.enable();
        this.errorKind.set(kind);
        this.showFieldErrors.set(false);
        if (kind === 'invalid-credentials') {
          this.form.controls.password.reset();
          // Wait for the re-enabled input before moving focus.
          queueMicrotask(() => this.passwordInput().nativeElement.focus());
        }
      },
    });
  }

  private focusFirstInvalidField(): void {
    const target = this.form.controls.username.invalid
      ? this.usernameInput()
      : this.passwordInput();
    target.nativeElement.focus();
  }
}
