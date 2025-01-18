
import { Component, ElementRef, HostListener, OnInit, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { SwitchThemeButton } from "../switch-theme/switch-theme.component";
import { LangSwitchComponent } from "../switch-lang/switch-lang.component";
import { MyRoute, ROUTES } from "../../../router";
 
@Component({
  selector: "menu-component",
  standalone: true,
  templateUrl: "./menu.component.html",
  styleUrl: "./menu.component.scss",
  imports: [SwitchThemeButton, CommonModule, RouterLink, LangSwitchComponent]
})
export class MenuComponent implements OnInit {
  private _expand: boolean = false;
  private _menu: MyRoute[] = [];

  @ViewChild('MenuHeaderRef')
  private refMenu!: ElementRef<HTMLDivElement>;

  public ngOnInit(): void {
    this._menu = [];
    for (let v of ROUTES) {
      if (v.show)
        this._menu.push(v);
    }
  }

  @HostListener('window:resize', ['$event'])
  public nResize(_: Event): void {
    const menu = this.refMenu.nativeElement;
    this._expand = menu.classList.contains("responsive") ? false : this._expand;
  }

  public onExpandMenu(onlyIfOpened = false): void {
    this._expand = !this._expand;
  }

  public get menu(): MyRoute[] {
    return this._menu;
  }

  public get expand(): boolean {
    return this._expand;
  }

}
