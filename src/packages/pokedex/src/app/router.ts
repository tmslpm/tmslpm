
import { ResolveData, Route } from "@angular/router";
import { ErrorComponent } from "./views/error/error.component";
import { PokedexHttp } from "./views/pokedex/pokedex-http.component";
import { PokedexFetch } from "./views/pokedex/pokedex-fetch.component";
import { HomeComponent } from "./views/home/home.component";

export const ROUTES: MyRoute[] = [
  createMyRoute("home", "Home", HomeComponent, "Home"),
  createMyRoute("", "Home", HomeComponent),
  createMyRoute("pokedex-fetch", "Pokedex Fetch", PokedexFetch, "Pokedex Fetch Api"),
  createMyRoute("pokedex-http", "Pokedex Http", PokedexHttp, "Pokedex Http Api"),
  createMyRoute("**", "Error", ErrorComponent),
];

export interface MyRoute extends Route {
  show: boolean;
  titleLink?: string | "unused";
}

function createMyRoute(path: string, title: string, component: any, titleLink = "", resolve: ResolveData = {}): MyRoute {
  return {
    path: path,
    title: title,
    titleLink: titleLink,
    component: component,
    show: titleLink.length > 0
  };
}
