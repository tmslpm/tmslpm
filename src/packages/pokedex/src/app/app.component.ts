import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuComponent } from "./views/components/menu/menu.component";
import { FooterComponent } from "./views/components/footer/footer.component";
import { NotificationComponent } from "./views/components/notification/notification.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MenuComponent, FooterComponent, NotificationComponent],
  templateUrl: './app.component.html'
})
export class AppComponent { }
