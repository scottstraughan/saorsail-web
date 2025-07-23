import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'swc-settings-block-item',
  standalone: true,
  styleUrl: './settings-block-item.component.scss',
  templateUrl: './settings-block-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsBlockItemComponent {
  readonly title = input.required<string>();
  readonly subTitle = input<string | undefined>(undefined);
}