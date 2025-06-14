import { ChangeDetectionStrategy, Component, Inject, Signal, signal, WritableSignal } from '@angular/core';
import { MaskableIconComponent } from '../../../shared/components/maskable-icon/maskable-icon.component';
import { IconButtonComponent } from '../../../shared/components/icon-button/icon-button.component';
import { PopupInstance } from '../../../shared/components/popup/popup.service';
import { Category } from '../../../shared/models/repository.model';
import { ApplicationService } from '../../../shared/services/application.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { LocalizationService } from '../../../shared/services/localization.service';
import { AsyncPipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DefaultOrderFilters, Filters, Order } from '../../../shared/models/filters.model';

@Component({
  selector: 'swc-filters',
  standalone: true,
  imports: [
    MaskableIconComponent,
    IconButtonComponent,
    AsyncPipe,
    FormsModule,
    TitleCasePipe
  ],
  templateUrl: './filters.component.html',
  styleUrls: [
    '../../../shared/components/popup/styles/small-simple.scss',
    './filters.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FiltersComponent {
  readonly categories: Signal<Category[]> = signal([]);
  readonly orders: Signal<Order[]> = signal(DefaultOrderFilters);

  readonly selectedCategory: WritableSignal<Category>;
  readonly selectedOrder: WritableSignal<Order>;
  readonly filters: Filters;

  constructor(
    @Inject('FDM_POPUP') private popupInstance: PopupInstance<FiltersComponent>,
    protected applicationService: ApplicationService,
    protected localizationService: LocalizationService
  ) {
    this.categories = toSignal(
      this.applicationService.getCategories(), { initialValue: [] });

    this.filters = this.popupInstance.getPopupData<Filters>();

    this.selectedCategory = signal(this.filters.category);
    this.selectedOrder = signal(this.filters.order);
  }

  onApplyFilters() {
    this.filters.category = this.selectedCategory();
    this.filters.order = this.selectedOrder();

    this.popupInstance.close(this.filters);
  }

  onCategoryChanged(
    $event: Category
  ) {
    this.selectedCategory.set($event);
  }

  onOrderChanged(
    $event: Order
  ) {
    this.selectedOrder.set($event);
  }

  compareCategory(
    o1: Category,
    o2: Category
  ) {
    if (!o1 || !o2) {
      return o1 == o2;
    }

    return o1.id === o2.id;
  }

  compareOrder(
    o1: Order,
    o2: Order
  ) {
    if (!o1 || !o2) {
      return o1 == o2;
    }

    return o1.by === o2.by && o1.direction == o2.direction;
  }

  getFriendlyOrder(
    order: Order
  ): string {
    if (order.by && order.direction) {
      return `${order.by.toString().replace('-', ' ')} (${order.direction})`;
    }

    return '';
  }
}
