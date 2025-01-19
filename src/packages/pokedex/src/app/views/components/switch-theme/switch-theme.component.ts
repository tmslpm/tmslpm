 import { Component, OnInit } from "@angular/core";
import { getItemInLocalStorageOrDefault, setItemInLocalStorage } from "../../../services/base/WebStore";

@Component({ selector: "btn-switch-theme", standalone: true, templateUrl: "./switch-theme.component.html" })
export class SwitchThemeButton implements OnInit {

  private _isDark: boolean = false;

  public constructor() {
    this.init();
  }

  public ngOnInit(): void {
    this.init();
  }

  private init(): void {
    this._isDark = getItemInLocalStorageOrDefault("data-theme", "false") === "true";
    document.documentElement.setAttribute("data-theme", this._isDark ? "dark" : "light");
  }

  public onSwitchTheme(): void {
    this._isDark = !this._isDark;
    document.documentElement.setAttribute("data-theme", this._isDark ? "dark" : "light");
    setItemInLocalStorage("data-theme", this._isDark ? "true" : "false");
  }

  public get isDark(): boolean {
    return this._isDark;
  }

}
