import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MaskableIconComponent } from '../maskable-icon/maskable-icon.component';

@Component({
  selector: 'swc-icon-button',
  standalone: true,
  imports: [
    MaskableIconComponent

  ],
  templateUrl: './icon-button.component.html',
  styleUrl: './icon-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconButtonComponent {
  readonly icon = input<string | undefined>(undefined);
  readonly label = input<string | undefined>(undefined);

  readonly href = input<string | undefined>(undefined);
  readonly target = input<string | undefined>(undefined);
  readonly rel = input<string | undefined>(undefined);

  readonly disabled = input<boolean>(false);
  readonly active = input<boolean>(false);

  /**
   * Called when a user clicks the component.
   * @param $event
   */
  onClick($event: MouseEvent) {
    if (this.disabled()) {
      $event.stopPropagation();
      return ;
    }
  }
}
