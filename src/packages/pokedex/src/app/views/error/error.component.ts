import { Component } from "@angular/core";
import { Meta } from "@angular/platform-browser";

@Component({
  selector: "app-error", standalone: true,
  templateUrl: "./error.component.html"
})
export class ErrorComponent {
  public constructor(meta: Meta) {
    let description = $localize`Aie! Error 404, page not found !`
    meta.updateTag({ name: 'description', content: description });
    meta.updateTag({ name: 'og:description', content: description });
    meta.updateTag({ name: 'og:title', content: $localize`Angular-Pokedex - Error Page - by @tmslpm` });
  }
}
