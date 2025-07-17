import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'swc-loading-indicator-visor',
  standalone: true,
  templateUrl: './loading-indicator-visor.component.html',
  styleUrl: './loading-indicator-visor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingIndicatorVisorComponent {
}