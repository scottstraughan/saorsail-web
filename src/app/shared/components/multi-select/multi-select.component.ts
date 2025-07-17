import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  input, OnChanges, output,
  signal,
  WritableSignal
} from '@angular/core';
import {  TitleCasePipe } from '@angular/common';
import { MaskableIconComponent } from '../maskable-icon/maskable-icon.component';
import { TestBooleanFilterGroup } from '../../services/filter2.service';

@Component({
  selector: 'swc-multi-select',
  standalone: true,
  imports: [
    MaskableIconComponent,
    TitleCasePipe
  ],
  templateUrl: './multi-select.component.html',
  styleUrl: './multi-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MultiSelectComponent implements OnChanges {
  readonly items = input<SelectItem[]>([]);
  readonly layout = input<LayoutMode>(LayoutMode.FILL);
  readonly selectionChange = output<SelectItem>();

  selectItems: WritableSignal<SelectItem[]> = signal([]);

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
    this.selectItems.set(this.items());
  }

  static fromFilter(
    booleanFilterGroup: any
  ): SelectItem[] {
    const filter: TestBooleanFilterGroup = booleanFilterGroup;
    const selectItems: SelectItem[] = [];

    for (const [value, enabled] of filter.value) {
      selectItems.push({
        name: value,
        selected: enabled
      });
    }

    return selectItems;
  }
}

export type SelectItem = {
  icon?: string
  name: string
  selected: boolean
}

export enum LayoutMode {
  FIT,
  FILL
}