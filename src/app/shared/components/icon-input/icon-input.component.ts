import { ChangeDetectionStrategy, Component, ElementRef, input, model, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MaskableIconComponent } from '../maskable-icon/maskable-icon.component';

@Component({
  selector: 'swc-icon-input',
  standalone: true,
  imports: [
    FormsModule,
    MaskableIconComponent
  ],
  templateUrl: './icon-input.component.html',
  styleUrl: './icon-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconInputComponent implements OnInit {
  value = model<string>('');
  placeholder = input<string>('');
  icon = input.required<string>();
  focus = input<boolean>(false);
  valid = input<boolean | undefined>();

  @ViewChild('inputElement')
  inputElement: ElementRef | undefined;

  /**
   * Call via @ViewChild, you can focus the input element by calling this function.
   */
  focusInput() {
    if (this.inputElement) {
      this.inputElement.nativeElement.focus();
    }
  }

  ngOnInit(): void {
    if (this.focus()) {
      setTimeout(() => {
        if (!this.inputElement) {
          return;
        }

        this.inputElement.nativeElement.focus();
      });
    }
  }
}
