import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, forkJoin, map, of } from "rxjs";
import { NamedAPIResourceList, Pokedex, PokedexParsed, PokemonData, PokemonSpecies, PokemonSpeciesParsed } from "../types/TypePokeApi";
import { calculateSessionStorageSize, hasDataInSessionStorage } from "./base/WebStore";
import { BasePokeApi } from "./BasePokeApi.service";

@Injectable({ providedIn: "root" })
export class HttpPokeApiService extends BasePokeApi {

  private readonly _fetchHttp: HttpClient;

  public constructor(fetchHttp: HttpClient) {
    super();
    this._fetchHttp = fetchHttp;
    this.fetchPokedexList();
    console.log(calculateSessionStorageSize());
  }

  public fetchPokemonList(pokedex: PokedexParsed, startIndex: number, endIndex: number): void {
    if (!(pokedex.id in this._pokemonListByPokedexId.value))
      this.initPokemonList(pokedex);

    if (endIndex - startIndex > 50)
      throw new Error("The number of fetch requests is far too large for this method! Need to use a batch pattern to continue. This method does not use this pattern.");

    let observables: Observable<PokemonSpeciesParsed>[] = [];
    pokedex.pokemon.slice(startIndex, endIndex).forEach(pokemonId => {
      if (!this.hasPokemonInList(pokedex, pokemonId)) {
        observables.push(this.fetchPokemon(pokemonId));
      }
    });

    forkJoin(observables).subscribe({ next: (v) => this.pushPokemonInList(pokedex, v), error: (e) => console.error(e) });
  }

  public fetchPokedexList(): void {
    const endpointPokdexList = this.pokedexListEndpoint(0, 60);
    const keyEndpointPokedexList = this.reducePokeApiEndpoint(endpointPokdexList, "h");

    // get pokedex url list from API
    if (!hasDataInSessionStorage(keyEndpointPokedexList)) {
      this._fetchHttp.get<NamedAPIResourceList>(endpointPokdexList)
        .pipe(map(pokedexListFromAPI => pokedexListFromAPI.results.map(v => v.url)))
        .subscribe({
          next: (pokedexUrlList) => {
            this.nextPokedexTotal(pokedexUrlList.length);
            pokedexUrlList.forEach(v => this.fetchPokedex(v).subscribe({
              next: (pokedexParsedList) => this.pushOnePokedexInList(pokedexParsedList),
              error: (e) => console.error(e)
            }));
            sessionStorage.setItem(keyEndpointPokedexList, JSON.stringify(pokedexUrlList));
          },
          error: (e) => console.error(e)
        });
    }

    // get pokedex url list from cache
    else {
      const pokedexUrlList: string[] = JSON.parse(sessionStorage.getItem(keyEndpointPokedexList) as string);
      this.nextPokedexTotal(pokedexUrlList.length);
      let requestsFetchPokedex: Observable<PokedexParsed>[] = pokedexUrlList.map(v => this.fetchPokedex(v));
      // wait all Observable before push pokedexlist
      forkJoin(requestsFetchPokedex).subscribe({
        next: (pokedexParsedList) => this.pushPokedexInList(pokedexParsedList),
        error: (e) => console.error(e)
      });
    }
  }

  protected fetchPokedex(pokedexUrl: string): Observable<PokedexParsed> {
    const keyEndpointPokedex = this.reducePokeApiEndpoint(pokedexUrl, "h");
    // get pokedex from cache
    if (hasDataInSessionStorage(keyEndpointPokedex))
      return of(JSON.parse(sessionStorage.getItem(keyEndpointPokedex) as string));
    // else: get pokedex from API 
    return this._fetchHttp.get<Pokedex>(pokedexUrl).pipe(map(pokedexDataFromApi => {
      let pokedexDataParsed = this.parsePokedex(pokedexDataFromApi);
      sessionStorage.setItem(keyEndpointPokedex, JSON.stringify(pokedexDataParsed));
      return pokedexDataParsed;
    }))
  }

  protected fetchPokemon(pokemonId: string): Observable<PokemonSpeciesParsed> {
    const endpointPokemonData = this.pokemonDataEndpoint(pokemonId);
    const endpointPokemonSpecie = this.pokemonSpecieEndpoint(pokemonId);
    const keyEndpointPokedmon = this.reducePokeApiEndpoint(endpointPokemonSpecie);
    // get data from API
    if (!hasDataInSessionStorage(keyEndpointPokedmon)) {
      return forkJoin([
        this._fetchHttp.get<PokemonSpecies>(endpointPokemonSpecie),
        this._fetchHttp.get<PokemonData>(endpointPokemonData)
      ]).pipe(map(([pokemonSpecieDataFromApi, pokemonDataFromApi]) => {
        let parsedPokemon = this.parsePokemon(pokemonSpecieDataFromApi, pokemonDataFromApi);
        sessionStorage.setItem(keyEndpointPokedmon, JSON.stringify(parsedPokemon));
        return parsedPokemon;
      }));
    }
    // get data from cache
    else {
      return of(JSON.parse(sessionStorage.getItem(keyEndpointPokedmon) as string));
    }
  }

}
