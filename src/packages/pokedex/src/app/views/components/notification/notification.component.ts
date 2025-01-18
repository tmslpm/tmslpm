import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { ENotificationType, NotificationDetails, NotificationService } from "../../../services/Notification.service";

@Component({
  selector: "notification-component", standalone: true, imports: [CommonModule],
  templateUrl: "./notification.component.html", styleUrl: "./notification.component.scss"
})
export class NotificationComponent implements OnInit, OnDestroy {
  private _subscriptions: Subscription[];
  private readonly _notificationService: NotificationService;
  private _notificationsMap: Map<number, NotificationDetails>;

  public constructor(notificationService: NotificationService) {
    this._subscriptions = [];
    this._notificationService = notificationService;
    this._notificationsMap = new Map();
    /* for (let index = 0; index < 33;) {
      this._notificationService.addInfo(index++ + " - Hi this is a info notification"); this._notificationService.addWarn(index++ + " - Alert your password is invalid"); this._notificationService.addError(index++ + " - Aie error occured")
    } */
  }

  // E v e n t: L i f e C y c l e

  public ngOnInit(): void {
    this._subscriptions = [
      this._notificationService.getObsNotificaitons.subscribe(v => this._notificationsMap = v)
    ];
  }

  public ngOnDestroy() {
    this._subscriptions.forEach(v => v.unsubscribe());
  }

  // E v e n t: UI

  public onRemoveNotification(uniqueIdentifier: number): void {
    this._notificationService.delete(uniqueIdentifier);
  }

  // G e t t e r

  public get notifications(): Map<number, NotificationDetails> {
    return this._notificationsMap;
  }

  public notificationType(currentType: ENotificationType): string {
    return (ENotificationType as any)[currentType];
  }
}
