import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MaskableIconComponent } from '../maskable-icon/maskable-icon.component';
import { LoadingIndicatorComponent } from '../loading-indicator/loading-indicator.component';

@Component({
  selector: 'swc-notice-container',
  standalone: true,
  imports: [
    MaskableIconComponent,
    LoadingIndicatorComponent
  ],
  templateUrl: './notice-container.component.html',
  styleUrl: './notice-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoticeContainerComponent {
  loading = input<boolean>(false);
  icon = input<string>();
  title = input.required<string>();
  subTitle = input<string | undefined>(undefined);
}