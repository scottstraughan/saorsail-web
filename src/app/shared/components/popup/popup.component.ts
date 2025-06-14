import { ChangeDetectionStrategy, Component, ComponentRef, ElementRef, HostListener } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { PopupInstance } from './popup.service';
import { MaskableIconComponent } from '../maskable-icon/maskable-icon.component';

@Component({
  selector: 'swc-popup-container',
  standalone: true,
  imports: [
    NgComponentOutlet,
    MaskableIconComponent,
  ],
  templateUrl: './popup.component.html',
  styleUrl: './popup.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PopupComponent {
  /**
   * The component that is to be shown in the popup.
   * @protected
   */
  protected component: any;

  /**
   * Reference to a popup instance.
   * @protected
   */
  protected popupInstance?: PopupInstance<any>;

  /**
   * Constructor.
   * @param elementRef
   */
  constructor(
    private elementRef: ElementRef
  ) { }

  /**
   * Attach a component into the popup.
   * @param popupInstance
   * @param component
   */
  attach<T>(
    popupInstance: PopupInstance<T>,
    component: ComponentRef<T>
  ) {
    this.component = component;
    this.popupInstance = popupInstance;
  }

  /**
   * Called by the user if the user clicks the close icon.
   */
  onClose() {
    this.popupInstance?.close();
  }

  /**
   * This function is designed to close the popup if the popup container is clicked but not any component within in.
   * @param event
   */
  @HostListener('click', ['$event'])
  private onClick(
    event: any
  ) {
    if (event.target.localName === this.elementRef.nativeElement.localName) {
      this.popupInstance?.close()
    }
  }

  /**
   * Called when the user presses the escape key and closes the popup.
   * @private
   */
  @HostListener('document:keydown.escape')
  private onEscapeKeyPressed() {
    this.popupInstance?.close();
  }
}
