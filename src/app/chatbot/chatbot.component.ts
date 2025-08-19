import {
  ChangeDetectionStrategy,
  Component,
  ElementRef, HostListener,
  Signal,
  signal,
  ViewChild, WritableSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatbotService, Message } from '../shared/services/chatbot.service';
import { tap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { LoadingIndicatorComponent } from '../shared/components/loading-indicator/loading-indicator.component';
import { MaskableIconComponent } from '../shared/components/maskable-icon/maskable-icon.component';
import { IconComponent } from '../shared/components/icon/icon.component';

@Component({
  selector: 'swc-chatbot',
  imports: [
    FormsModule,
    LoadingIndicatorComponent,
    MaskableIconComponent,
    IconComponent
  ],
  templateUrl: './chatbot.component.html',
  standalone: true,
  styleUrl: './chatbot.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatbotComponent {
  protected messages: Signal<Message[]> = signal([]);
  protected sending: WritableSignal<boolean> = signal(false);
  protected showing: WritableSignal<boolean> = signal(false);

  protected message: string = ''

  @ViewChild('scrolled')
  private bottomEl!: ElementRef;

  @ViewChild('messageTextarea')
  private textarea!: ElementRef<HTMLTextAreaElement>;

  /**
   * Constructor.
   */
  constructor(
    private chatboxService: ChatbotService,
  ) {
    this.messages = toSignal(
      this.chatboxService.getMessages()
        .pipe(
          tap(() => this.scrollToBottom())
        ), { initialValue: [] });
  }

  /**
   * Called when a user wishes to send a message.
   */
  onSendMessage() {
    this.sending.set(true);
    this.scrollToBottom();

    this.chatboxService.sendMessage(this.message).pipe(
      tap(() => this.sending.set(false)),
      tap(() => this.message = ''),
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
  onShowChat() {
    this.showing.set(true);
    this.scrollToBottom();
  }

  /**
   * Called when the message panel container has been clicked.
   */
  onContainerClicked() {
    this.showing.set(false);
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
    this.showing.set(false);
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
