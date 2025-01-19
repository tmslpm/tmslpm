import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({ providedIn: "root" })
export class NotificationService {
  private readonly _notifications: BehaviorSubject<Map<number, NotificationDetails>>;
  private readonly _obsNotifications: Observable<Map<number, NotificationDetails>>;
  private _uniqueIdentifier: number;

  public constructor() {
    this._uniqueIdentifier = 0;
    this._notifications = new BehaviorSubject<Map<number, NotificationDetails>>(new Map());
    this._obsNotifications = this._notifications.asObservable();
  }

  public addInfo(notificationText: string) {
    this.add(ENotificationType.INFO, notificationText);
  }

  public addWarn(notificationText: string) {
    this.add(ENotificationType.WARN, notificationText);
  }

  public addError(notificationText: string) {
    this.add(ENotificationType.ERROR, notificationText);
  }

  public addNetworkError() {
    this.addError("Aie! An network error has occurred, we're sorry.")
  }

  private add(notificationType: ENotificationType, notificationText: string): number {
    let currentIdentifier = this._uniqueIdentifier++;
    let mapCopy = new Map(this._notifications.value);
    mapCopy.set(currentIdentifier, { identifier: currentIdentifier, type: notificationType, text: notificationText });
    this._notifications.next(mapCopy);
    return currentIdentifier;
  }

  public delete(uniqueIdentifier: number): void {
    if (this._notifications.value.has(uniqueIdentifier)) {
      let mapCopy = new Map(this._notifications.value);
      mapCopy.delete(uniqueIdentifier);
      this._notifications.next(mapCopy);
    }
  }

  public get getObsNotificaitons(): Observable<Map<number, NotificationDetails>> {
    return this._obsNotifications;
  }

}

export type NotificationDetails = {
  identifier: number,
  type: ENotificationType,
  text: string
}

export enum ENotificationType {
  INFO,
  WARN,
  ERROR,
} 
