import { ChangeDetectionStrategy, Component, computed, input, Signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { ImageReference } from '../../models/repository.model';

@Component({
  selector: 'swc-icon',
  standalone: true,
  imports: [
    NgOptimizedImage
  ],
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconComponent{
  readonly icon = input.required<ImageReference | string>();
  readonly alt = input<string>('');
  readonly size = input<number>(24);
  readonly priority = input<boolean>(false);
  readonly iconSrc: Signal<string> = computed(() =>
    `./assets/icons/${IconComponent.getIconPath(this.icon())}.svg`);

  static getIconPath(icon: ImageReference | string) {
    if (typeof icon === 'string') {
      return icon;
    }

    return icon.name;
  }
}