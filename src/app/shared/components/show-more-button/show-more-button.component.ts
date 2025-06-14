import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MaskableIconComponent } from '../maskable-icon/maskable-icon.component';
import { LoadingIndicatorComponent } from '../loading-indicator/loading-indicator.component';

@Component({
  selector: 'swc-show-more-button',
  standalone: true,
  imports: [
    MaskableIconComponent,
    LoadingIndicatorComponent
  ],
  templateUrl: './show-more-button.component.html',
  styleUrl: './show-more-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShowMoreButtonComponent {
  loading = input<boolean>(false);
}
