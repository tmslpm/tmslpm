import { Directive, ElementRef, HostListener } from "@angular/core";

@Directive({ selector: '[hoverHighlight]', standalone: true })
export class HoverHighlightDirective {
  private readonly _target: ElementRef;

  public constructor(target: ElementRef) {
    this._target = target;
  }

  @HostListener('mouseenter')
  public onMouseEnter() {
    this._target.nativeElement.style.color = "yellow";
  }

  @HostListener('mouseleave')
  public onMouseLeave() {
    this._target.nativeElement.style.color = "";
  }

}
