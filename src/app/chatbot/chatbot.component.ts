import {
  ChangeDetectionStrategy,
  Component,
  ElementRef, HostListener, inject,
  Signal,
  signal,
  ViewChild, WritableSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatbotService, Message } from '../shared/services/chatbot.service';
import { Subject, takeUntil, tap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { LoadingIndicatorComponent } from '../shared/components/loading-indicator/loading-indicator.component';
import { IconComponent } from '../shared/components/icon/icon.component';

@Component({
  selector: 'swc-chatbot',
  imports: [
    FormsModule,
    LoadingIndicatorComponent,
    IconComponent
  ],
  templateUrl: './chatbot.component.html',
  standalone: true,
  styleUrl: './chatbot.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatbotComponent {
  /**
   * Signal with all the messages.
   * @protected
   */
  protected messages: WritableSignal<Message[]> = signal([]);

  /**
   * If we are sending or not.
   * @protected
   */
  protected sending: WritableSignal<boolean> = signal(false);

  /**
   * If we are showing Bob or not.
   * @protected
   */
  protected isVisible: WritableSignal<boolean> = signal(false);

  /**
   * Subject to track when we are closed or not.
   * @protected
   */
  protected onDestroy: Subject<void> = new Subject();

  /**
   * Service to use.
   * @protected
   */
  protected chatboxService: ChatbotService = inject(ChatbotService);

  /**
   * New send message
   * @protected
   */
  protected newMessage: string = ''

  /**
   * Used to scroll.
   * @protected
   */
  @ViewChild('scrolled')
  protected bottomEl!: ElementRef;

  /**
   * Textarea reference.
   * @protected
   */
  @ViewChild('messageTextarea')
  protected textarea!: ElementRef<HTMLTextAreaElement>;

  /**
   * Called when a user wishes to send a message.
   */
  onSendMessage() {
    this.sending.set(true);
    this.scrollToBottom();

    this.chatboxService.sendMessage(this.newMessage).pipe(
      tap(() => this.sending.set(false)),
      tap(() => this.newMessage = ''),
      tap(() => this.scrollToBottom())
    )
    .subscribe();
  }

  /**
   * Called when the contents of a new message have changed.
   */
  onMessageChanged() {
    const textarea = this.textarea.nativeElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  /**
   * Called when the user has clicked Bob, and we should show the message panel.
   */
  onShowBob() {
    this.isVisible.set(true);
    this.scrollToBottom();

    this.chatboxService.getMessages()
      .pipe(
        tap(messages =>
          this.messages.set(messages)),
        tap(() =>
          this.scrollToBottom()),
        takeUntil(this.onDestroy)
      )
      .subscribe();
  }

  /**
   * Called when we should close Bob.
   */
  onCloseBob() {
    this.isVisible.set(false);
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  /**
   * Called when the message panel container has been clicked.
   */
  onContainerClicked() {
    this.onCloseBob();
  }

  /**
   * Called when the chatbox has been clicked.
   */
  onChatboxClicked(
    $event: MouseEvent
  ) {
    $event.stopPropagation();
    $event.preventDefault();
  }

  /**
   * Called when the user presses the escape key and closes the popup.
   * @private
   */
  @HostListener('document:keydown.escape')
  onEscapeKeyPressed() {
    this.isVisible.set(false);
  }

  /**
   * Scroll to the bottom of the history view.
   * @private
   */
  private scrollToBottom(): void {
    setTimeout(() => {
      try {
        const el = this.bottomEl.nativeElement;
        el.scrollTop = el.scrollHeight;
      } catch (err) {}
    }, 100);
  }
}
