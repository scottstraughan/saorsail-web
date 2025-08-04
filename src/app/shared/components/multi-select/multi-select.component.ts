import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  input, OnChanges, output,
  signal,
  WritableSignal
} from '@angular/core';

@Component({
  selector: 'swc-multi-select',
  standalone: true,
  templateUrl: './multi-select.component.html',
  styleUrl: './multi-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MultiSelectComponent implements OnChanges {
  readonly items = input<SelectItem[] | null>([]);
  readonly layout = input<LayoutMode>(LayoutMode.FILL);
  readonly selectionChange = output<SelectItem>();

  readonly selectItems: WritableSignal<SelectItem[]> = signal([]);

  @HostBinding('class.fill')
  _layoutMode = this.layout() == LayoutMode.FIT;

  onClick(
    index: number,
    item: SelectItem
  ) {
    this.selectItems.update(items => {
      item.selected = !item.selected;
      items[index] = item;
      return items.slice();
    });

    this.selectionChange.emit(item);
  }

  ngOnChanges(): void {
    this._layoutMode = this.layout() == LayoutMode.FIT;

    const items = this.items();

    if (!items)
      return;

    this.selectItems.set(items);
  }
}

export type SelectItem = {
  id: string
  title: string
  selected: boolean
}

export enum LayoutMode {
  FIT,
  FILL
}