import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'swc-settings-header',
  standalone: true,
  styleUrl: './settings-header.component.scss',
  templateUrl: './settings-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsHeaderComponent {
  readonly name = input.required<string>();
  readonly subTitle = input<string | undefined>(undefined);
}