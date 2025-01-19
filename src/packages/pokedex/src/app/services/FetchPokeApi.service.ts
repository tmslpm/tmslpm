
import { NamedAPIResourceList, Pokedex, PokedexParsed, PokemonData, PokemonSpecies, PokemonSpeciesParsed } from "../types/TypePokeApi";
import { fetchJSON } from "./base/Fetch";
import { Injectable } from "@angular/core";
import { BasePokeApi } from "./BasePokeApi.service";
import { calculateSessionStorageSize, hasDataInSessionStorage } from "./base/WebStore";

@Injectable({ providedIn: "root" })
export class FetchPokeApiService extends BasePokeApi {

  public constructor() {
    super();
    this.fetchPokedexList();
    console.log(calculateSessionStorageSize());
  }

  public fetchPokemonList(pokedex: PokedexParsed, startIndex: number, endIndex: number): void {
    if (!(pokedex.id in this._pokemonListByPokedexId.value))
      this.initPokemonList(pokedex);

    if (endIndex - startIndex > 50)
      throw new Error("The number of fetch requests is far too large for this method! Need to use a batch pattern to continue. This method does not use this pattern.");

    let promises: Promise<PokemonSpeciesParsed>[] = [];
    pokedex.pokemon.slice(startIndex, endIndex).forEach(pokemonId => {
      if (!this.hasPokemonInList(pokedex, pokemonId)) {
        promises.push(this.fetchPokemon(pokemonId));
      }
    });

    Promise.all(promises).then(v => this.pushPokemonInList(pokedex, v))
  }

  public fetchPokedexList(): void {
    const endpointPokdexList = this.pokedexListEndpoint(0, 60);
    const keyEndpointPokedexList = this.reducePokeApiEndpoint(endpointPokdexList);
    const promises: Promise<PokedexParsed>[] = [];
    // get pokedex url list from API
    if (!hasDataInSessionStorage(keyEndpointPokedexList)) {
      fetchJSON<NamedAPIResourceList>(endpointPokdexList).then(pokedexListFromAPI => {
        const pokedexUrlList = pokedexListFromAPI.results.map(v => v.url);
        this.nextPokedexTotal(pokedexUrlList.length);
        pokedexUrlList.forEach(pokedexUrl => this.fetchPokedex(pokedexUrl).then(pokedexParsedList => this.pushOnePokedexInList(pokedexParsedList)));
        sessionStorage.setItem(keyEndpointPokedexList, JSON.stringify(pokedexUrlList));
      });
    }
    // get pokedex url list from cache
    else {
      const pokedexUrlList: string[] = JSON.parse(sessionStorage.getItem(keyEndpointPokedexList) as string);
      this.nextPokedexTotal(pokedexUrlList.length);
      pokedexUrlList.forEach(pokedexUrl => promises.push(this.fetchPokedex(pokedexUrl)));
      // wait all promese before push pokedexlist
      Promise.all(promises).then(pokedexParsedList => this.pushPokedexInList(pokedexParsedList));
    }
  }

  protected async fetchPokedex(pokedexUrl: string): Promise<PokedexParsed> {
    const keyEndpointPokedex = this.reducePokeApiEndpoint(pokedexUrl);
    // get pokedex from cache
    if (hasDataInSessionStorage(keyEndpointPokedex))
      return JSON.parse(sessionStorage.getItem(keyEndpointPokedex) as string);
    // else: get pokedex from API 
    return fetchJSON<Pokedex>(pokedexUrl).then(pokedexDataFromApi => {
      let pokedexDataParsed = this.parsePokedex(pokedexDataFromApi);
      sessionStorage.setItem(keyEndpointPokedex, JSON.stringify(pokedexDataParsed));
      return pokedexDataParsed;
    });
  }

  protected async fetchPokemon(pokemonId: string): Promise<PokemonSpeciesParsed> {
    const endpointPokemonData = this.pokemonDataEndpoint(pokemonId);
    const endpointPokemonSpecie = this.pokemonSpecieEndpoint(pokemonId);
    const keyEndpointPokedmon = this.reducePokeApiEndpoint(endpointPokemonSpecie);
    // get data from API
    if (!hasDataInSessionStorage(keyEndpointPokedmon)) {
      return Promise.all([
        fetchJSON<PokemonSpecies>(endpointPokemonSpecie),
        fetchJSON<PokemonData>(endpointPokemonData)
      ]).then(([pokemonSpecieDataFromApi, pokemonDataFromApi]) => {
        let parsedPokemon = this.parsePokemon(pokemonSpecieDataFromApi, pokemonDataFromApi);
        sessionStorage.setItem(keyEndpointPokedmon, JSON.stringify(parsedPokemon));
        return parsedPokemon;
      });
    }
    // get data from cache
    else {
      return JSON.parse(sessionStorage.getItem(keyEndpointPokedmon) as string);
    }
  }
}
