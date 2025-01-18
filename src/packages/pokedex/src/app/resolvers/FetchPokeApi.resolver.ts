import { FetchPokeApiService } from "../services/FetchPokeApi.service";
import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from "@angular/router";

export const resolveFetchPokedexList: ResolveFn<void> = (_r: ActivatedRouteSnapshot, _s: RouterStateSnapshot): void => {
  inject(FetchPokeApiService).fetchPokedexList();
}
