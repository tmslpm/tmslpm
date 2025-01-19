
import { Pokedex, PokedexParsed, PokemonData, PokemonSpecies, PokemonSpeciesParsed } from "../types/TypePokeApi";
import { BehaviorSubject, Observable } from "rxjs";
import { LangSwitchComponent } from "../views/components/switch-lang/switch-lang.component";

export abstract class BasePokeApi {
  protected readonly _pokedexTotal: BehaviorSubject<number>;
  protected readonly _obsPokedexTotal: Observable<number>;

  protected readonly _pokedexList: BehaviorSubject<PokedexParsed[]>;
  protected readonly _obsPokedexList: Observable<PokedexParsed[]>;

  protected readonly _pokemonListByPokedexId: BehaviorSubject<{ [key: string]: PokemonSpeciesParsed[] }>;
  protected readonly _obsPokemonListByPokedex: Observable<{ [key: string]: PokemonSpeciesParsed[] }>;

  public constructor() {
    this._pokedexTotal = new BehaviorSubject(0);
    this._obsPokedexTotal = this._pokedexTotal.asObservable();

    this._pokedexList = new BehaviorSubject<PokedexParsed[]>([]);
    this._obsPokedexList = this._pokedexList.asObservable();

    this._pokemonListByPokedexId = new BehaviorSubject<{ [key: string]: PokemonSpeciesParsed[] }>({});
    this._obsPokemonListByPokedex = this._pokemonListByPokedexId.asObservable();
  }

  // F e t c h  D a t a

  public abstract fetchPokemonList(pokedex: PokedexParsed, startIndex: number, endIndex: number): void;

  public abstract fetchPokedexList(): void

  protected abstract fetchPokedex(pokedexUrl: string): any;

  protected abstract fetchPokemon(pokemonId: string): any;

  // U t i l s 

  protected initPokemonList(pokedex: PokedexParsed) {
    const v = { ...this._pokemonListByPokedexId.value, [pokedex.id]: [] };
    this._pokemonListByPokedexId.next(v);
  }

  protected hasPokemonInList(pokedex: PokedexParsed, pokemonId: string): boolean {
    return this._pokemonListByPokedexId.value[pokedex.id].find(pokemon => pokemon.id.toString() == pokemonId) != undefined;
  }

  protected pushPokemonInList(pokedex: PokedexParsed, pokemonData: PokemonSpeciesParsed[]): void {
    const copyOfPokemonData = [...this._pokemonListByPokedexId.value[pokedex.id], ...pokemonData].sort((a, b) => a.id - b.id);
    const copyOfpokemonListByPokedexId = { ...this._pokemonListByPokedexId.value, [pokedex.id]: copyOfPokemonData };
    this._pokemonListByPokedexId.next(copyOfpokemonListByPokedexId);
  }

  protected pushOnePokemonInList(pokedex: PokedexParsed, ...pokemonData: PokemonSpeciesParsed[]): void {
    this.pushPokemonInList(pokedex, pokemonData);
  }

  protected pushPokedexInList(pokedex: PokedexParsed[]) {
    const copyOfPokedexList = [...this._pokedexList.value, ...pokedex].sort((a, b) => a.id - b.id);
    this._pokedexList.next(copyOfPokedexList);
  }

  protected pushOnePokedexInList(...pokedex: PokedexParsed[]) {
    this.pushPokedexInList(pokedex);
  }

  protected nextPokedexTotal(total: number) {
    this._pokedexTotal.next(total);
  }

  // P a r s e  D a t a

  protected parsePokedex(dataFromApi: Pokedex): PokedexParsed {
    const LANGs = LangSwitchComponent.LANGs.map(v => v.code);
    let names = dataFromApi.names.filter(v => LANGs.find(lang => v.language.name.includes(lang)));
    let descs = dataFromApi.descriptions.filter(v => LANGs.find(lang => v.language.name.includes(lang)));
    let enDescs = descs.find(v => v.language.name == "en")?.description || "???";
    return {
      id: dataFromApi.id,
      name: {
        fr: names.find(v => v.language.name == "fr")?.name || dataFromApi.name,
        en: names.find(v => v.language.name == "en")?.name || dataFromApi.name
      },
      desc: {
        fr: descs.find(v => v.language.name == "fr")?.description || enDescs,
        en: enDescs
      },
      pokemon: dataFromApi.pokemon_entries.map(v => {
        let urlSplit = v.pokemon_species.url.split("/");
        return urlSplit[urlSplit.length - 1] === "" ? urlSplit[urlSplit.length - 2] : urlSplit[urlSplit.length - 1];
      })
    };
  }

  protected parsePokemon(dataFromApi: PokemonSpecies, pokemonDataFromApi: PokemonData): PokemonSpeciesParsed {
    const LANGs = LangSwitchComponent.LANGs.map(v => v.locale.split("-")[0]);
    let lang = LangSwitchComponent.getCurrentLang().locale.split("-")[0];
    let names = dataFromApi.names.filter(v => LANGs.find(lang => v.language.name.includes(lang)));
    let descs = dataFromApi.flavor_text_entries.filter(v => v.language.name.includes(lang));
    let enDescs = descs.find(v => v.language.name == "en")?.flavor_text || "???";
    let frDecs = descs.find(v => v.language.name == "fr")?.flavor_text || enDescs;
    let spritesParsed = Object.values(pokemonDataFromApi.sprites).filter(v => typeof v === "string" && v.startsWith("https"))
      .sort((a, b) => (a as string).length - (b as string).length) as string[];

    return {
      id: dataFromApi.id,
      name: {
        fr: names.find(v => v.language.name == "fr")?.name || dataFromApi.name,
        en: names.find(v => v.language.name == "en")?.name || dataFromApi.name
      },
      desc: {
        fr: frDecs.length > 0 ? frDecs.replaceAll("\n", "").replaceAll("\f", "").toLocaleLowerCase() : "???",
        en: enDescs.length > 0 ? frDecs.replaceAll("\n", "").replaceAll("\f", "").toLocaleLowerCase() : "???"
      },
      height: pokemonDataFromApi.height,
      weight: pokemonDataFromApi.weight,
      sprite: spritesParsed,
      types: pokemonDataFromApi.types.map(v => v.type.name).join(", "),
    };
  }

  // G e t t e r

  public get getObsPokedexList(): Observable<PokedexParsed[]> {
    return this._obsPokedexList;
  }

  public get getObsPokemonListByPokedexId(): Observable<{ [key: string]: PokemonSpeciesParsed[] }> {
    return this._obsPokemonListByPokedex;
  }

  public get getObsPokedexTotal(): Observable<number> {
    return this._obsPokedexTotal;
  }

  protected reducePokeApiEndpoint(endpoint: string, prefix = ""): string {
    let endpointSplited = endpoint.split("api/v2/");
    let endpointWithoutDomain = endpointSplited[endpointSplited.length - 1];
    let endpointWithoutDomainSplited = endpointWithoutDomain.split("/");
    let reducedKey;
    switch (endpointWithoutDomainSplited[0]) {
      case "pokedex?offset=0&limit=60":
        reducedKey = "b";
        break;
      case "pokemon-species":
        reducedKey = "s";
        break;
      case "pokedex":
        reducedKey = "x";
        break;
      default:
        console.error(`/!\\ endpoint not reduced =>`, { endpoint: endpoint, lose_octet: endpoint.length * 2 });
        reducedKey = endpoint;
        break;
    }
    return prefix + endpointWithoutDomain.replace(endpointWithoutDomainSplited[0], reducedKey).replaceAll("/", "");
  }

  protected pokedexListEndpoint(offset: number, limit: number): string {
    return `https://pokeapi.co/api/v2/pokedex?offset=${offset}&limit=${limit}`;
  }

  protected pokemonSpecieEndpoint(id: number | string): string {
    return `https://pokeapi.co/api/v2/pokemon-species/${id}/`;
  }

  protected pokemonDataEndpoint(id: number | string): string {
    return `https://pokeapi.co/api/v2/pokemon/${id}/`;
  }

}
