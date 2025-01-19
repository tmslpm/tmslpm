import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { Meta } from "@angular/platform-browser";

@Component({
  selector: "app-home",
  standalone: true,
  templateUrl: "./home.component.html",
  imports: [CommonModule]
})
export class HomeComponent implements OnInit {
  public _pokeApiAvailable: boolean = false;

  public constructor(meta: Meta) {
    let description = $localize`Angular 17 project created for educational purposes to explore and learn the framework. It presents a functional Pokedex that connects to the pokeapi.co API. Two implementation are provided: one using the Fetch API in JavaScript and the other using Angular HttpClient module. Created by @tmslpm.`
    meta.updateTag({ name: 'description', content: description });
    meta.updateTag({ name: 'og:description', content: description });
    meta.updateTag({ name: 'og:title', content: $localize`Angular-Pokedex - Home Page - by @tmslpm` });

    this.tryCallApi();
  }

  public ngOnInit(): void {
    this.tryCallApi();
    setInterval(this.tryCallApi, 12000 * 50);
  }

  private tryCallApi() {
    fetch("https://pokeapi.co/api/v2/pokemon")
      .then(response => {
        this._pokeApiAvailable = response.ok;
      })
      .catch(error => {
        console.error("========>", error);
        this._pokeApiAvailable = false;
      })
  }

  public get pokeApiAvailable(): boolean {
    return this._pokeApiAvailable;
  }


}
