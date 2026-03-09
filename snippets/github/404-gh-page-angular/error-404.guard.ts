import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";

@Injectable({ providedIn: "root" })
export class Error404RedirectGuard implements CanActivate {

  constructor(private router: Router) { }

  canActivate(): boolean {
    if (document.body.getAttribute("data-page-type") === "404") {
      this.router.navigate(["/error"]);
      return false;
    }
    return true;
  }
}
