import { ChangeDetectionStrategy, Component, computed, HostBinding, input, OnInit, Signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { ImageReference } from '../../models/repository.model';

@Component({
  selector: 'swc-maskable-icon',
  standalone: true,
  imports: [
    NgOptimizedImage
  ],
  templateUrl: './maskable-icon.component.html',
  styleUrl: './maskable-icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MaskableIconComponent implements OnInit {
  readonly icon = input.required<ImageReference | string>();
  readonly alt = input<string>('');
  readonly size = input<number>(26);
  readonly priority = input<boolean>(false);
  readonly iconSrc: Signal<string> = computed(() => `./assets/icons/${MaskableIconComponent.getIconPath(this.icon())}.svg`);

  @HostBinding('style.--st-icon-src')
  protected backgroundImageSrc: string = ''

  static getIconPath(icon: ImageReference | string) {
    if (typeof icon === 'string') {
      return icon;
    }

    return icon.name;
  }

  /**
   * @inheritdoc
   */
  ngOnInit() {
    this.backgroundImageSrc = `url('./assets/icons/${MaskableIconComponent.getIconPath(this.icon())}.svg')`;
  }
}