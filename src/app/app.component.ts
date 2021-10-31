import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [
    { provide: AuthService, useClass: AuthService }
  ]
})
export class AppComponent {
  title = 'argon-dashboard-angular';

  constructor(
    private authService: AuthService
  ) {}
}
