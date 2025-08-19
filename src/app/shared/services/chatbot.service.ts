import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, take, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private static WELCOME_MESSAGE = {
    body: "👋 Hi! I'm Bob, an AI assistant. I can find you apps, install apps to devices or even download them.",
    sent: false,
    date: new Date(),
    loading: false,
  };

  private messages$: BehaviorSubject<Message[]> = new BehaviorSubject<any>([]);
  private messages: Message[] = [ChatbotService.WELCOME_MESSAGE];

  constructor(
    private httpClient: HttpClient,
    @Inject(LOCAL_STORAGE) private storageService: StorageService
  ) {
    this.injectHistory();
  }

  sendMessage(
    body: string
  ): Observable<any> {
    const message: Message = {
      body: body,
      sent: true,
      date: new Date(),
      loading: true
    }

    this.messages.push(message);
    this.notify();

    return this.httpClient.post<Response>("http://localhost:3001/send", {
      body: message.body,
      history: this.messages
    })
      .pipe(
        tap(result => this.messages.push({
          body: result.message,
          date: new Date(),
          sent: false,
          loading: false
        })),
        catchError(error => {
          alert(error);
          return error;
        }),
        tap(() => message.loading = false),
        tap(() => this.notify()),
        take(1)
      );
  }

  getMessages(): Observable<Message[]> {
    return this.messages$.asObservable();
  }

  private notify() {
    this.messages$.next(this.messages);
    this.storageService.set('chatbot-messages', this.messages);
  }

  private injectHistory() {
    const storedMessages: Message[] = this.storageService.get('chatbot-messages');

    if (Array.isArray(storedMessages) && storedMessages.length > 0) {
      this.messages = storedMessages;
    }

    this.notify();
  }
}

/**
 * Type for a message.
 */
export type Message = {
  body: string
  sent?: boolean
  date: Date
  loading: boolean
}

/**
 * Response from backend.
 */
export type Response = {
  message: string
}