import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Application } from '../../models/repository.model';
import { LocalizationService } from '../../services/localization.service';
import { RouterLink } from '@angular/router';
import { InstallButtonComponent } from '../install-button/install-button.component';
import { ApplicationService } from '../../services/application.service';
import { MaskableIconComponent } from '../maskable-icon/maskable-icon.component';

@Component({
  selector: 'swc-application-widget',
  standalone: true,
  imports: [
    AsyncPipe,
    RouterLink,
    InstallButtonComponent,
    MaskableIconComponent
  ],
  templateUrl: './application-widget.component.html',
  styleUrl: './application-widget.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApplicationWidgetComponent {
  readonly application = input.required<Application>();
  readonly clicked = output<void>();

  constructor(
    protected localizationService: LocalizationService,
    protected applicationService: ApplicationService,
  ) { }
}