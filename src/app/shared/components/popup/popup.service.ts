import { ApplicationRef, ComponentRef, EventEmitter, Injectable, Injector, ViewContainerRef } from '@angular/core';
import { PopupComponent } from './popup.component';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PopupService {
  /**
   * Constructor.
   * @param applicationRef
   */
  constructor(
    protected applicationRef: ApplicationRef
  ) { }

  /**
   * Show a new popup with the component provided as its contents. Optionally, you can provide popupData that will be
   * made available to the component using the FDM_POPUP_DATA provider.
   * @param component
   * @param popupData
   */
  show<T>(
    component: any,
    popupData?: any
  ): PopupInstance<T> {
    const rootContainerRef = this.applicationRef.components[0].injector.get(ViewContainerRef);

    if (!rootContainerRef) {
      throw new PopupError('No top level component that is attachable could be found.');
    }

    const popupReference: PopupInstance<T> = new PopupInstance<T>(popupData);

    const injector = Injector.create({
      providers: [{
        provide: 'FDM_POPUP',
        useValue: popupReference
      }, {
        provide: 'FDM_POPUP_DATA',
        useValue: popupData
      }],
    });

    const containerReference = rootContainerRef.createComponent(PopupComponent, { injector: injector });
    containerReference.instance.attach<T>(popupReference, component);

    popupReference.setContainerRef(containerReference);
    return popupReference;
  }
}

/**
 * Represents a popup instance. This is injectable into any component and available via the FDM_POPUP provider. This
 * class provide the ability to close popups, access popup data etc.
 */
export class PopupInstance<T> {
  private containerRef: ComponentRef<PopupComponent> | undefined;
  private closed: EventEmitter<any> = new EventEmitter();

  /**
   * Constructor.
   * @param popupData
   */
  constructor(
    private popupData?: any
  ) { }

  /**
   * Get the popup data.
   */
  getPopupData<T>(): T {
    return this.popupData;
  }

  /**
   * Set the container reference. That is, the container and the component to show.
   * @param containerRef
   */
  setContainerRef(
    containerRef: ComponentRef<PopupComponent>
  ) {
    if (this.containerRef) {
      throw new PopupError('Popup container reference has already been set.');
    }

    this.containerRef = containerRef;
  }

  /**
   * Close the popup.
   * @param data
   */
  close(
    data?: any
  ) {
    this.closed.next(data);
    this.containerRef?.destroy();
  }

  /**
   * Subscribe to this to be notified when the popup has closed.
   */
  onClose(): Observable<any> {
    return this.closed.asObservable();
  }
}

/**
 * Thrown when a popup error happens.
 */
export class PopupError extends Error {}
