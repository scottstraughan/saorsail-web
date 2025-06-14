import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MaskableIconComponent } from '../maskable-icon/maskable-icon.component';

@Component({
  selector: 'swc-loading-indicator',
  standalone: true,
  imports: [
    MaskableIconComponent
  ],
  templateUrl: './loading-indicator.component.html',
  styleUrl: './loading-indicator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingIndicatorComponent {
  readonly loading = input<boolean>(true);
}