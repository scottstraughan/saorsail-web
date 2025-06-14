import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  input,
  signal,
  WritableSignal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClipboardService } from 'ngx-clipboard';
import { MaskableIconComponent } from '../maskable-icon/maskable-icon.component';

@Component({
  selector: 'swc-copy-input',
  standalone: true,
  templateUrl: './copy-input.component.html',
  styleUrl: './copy-input.component.scss',
  imports: [
    FormsModule,
    MaskableIconComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CopyInputComponent {
  readonly content = input<string>('');
  readonly copied: WritableSignal<boolean> = signal(false);
  readonly hintColor = input<string>('var(--hint-color)');
  readonly width = input<string>('24px');

  /**
   * Constructor.
   * @param clipboardService
   */
  constructor(
    protected clipboardService: ClipboardService
  ) { }

  /**
   * Called when the user presses the copy button.
   */
  @HostListener('click', ['$event'])
  onCopy() {
    this.clipboardService.copy(this.content());

    this.copied.set(true);

    setTimeout(() => {
      this.copied.set(false);
    }, 1500);
  }
}
