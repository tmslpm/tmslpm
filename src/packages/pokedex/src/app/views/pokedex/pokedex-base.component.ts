
import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { ConvertUnitMeasure } from "../../pipes/convert-unit-measure.pipe";
import { BasePokeApi } from "../../services/BasePokeApi.service";
import { NotificationService } from "../../services/Notification.service";
import { TextToSpeechService } from "../../services/TTS.service";
import { PokedexParsed, PokemonSpeciesParsed } from "../../types/TypePokeApi";
import { LangSwitchComponent } from "../components/switch-lang/switch-lang.component";

@Component({
  selector: "view-pokedex-base",
  standalone: true, imports: [CommonModule, ConvertUnitMeasure],
  templateUrl: "./pokedex.component.html"
})
export abstract class PokedexBase implements OnInit, OnDestroy {
  private static ITEM_DISPLAYED_SCREEN_LIST = 9;
  private _subscriptions: Subscription[];
  private readonly _notificationService: NotificationService;
  private readonly _pokemonApiService: BasePokeApi;
  private readonly _textToSpeechService: TextToSpeechService;

  private readonly _screenPokedexList: ScreenListController<PokedexParsed>;
  private readonly _allScreenPokemonList: Map<string, ScreenListController<PokemonSpeciesParsed>>;
  private _isCurrentPokedexScreenlList: boolean;
  private _spriteIdx: number;
  private _hasAnimationTTSPlayed: boolean;
  private _hasAnimationLedPlayed: boolean;

  public constructor(notificationService: NotificationService, pokemonApiService: BasePokeApi, TTSService: TextToSpeechService) {
    this._subscriptions = [];
    this._allScreenPokemonList = new Map();
    this._screenPokedexList = this.createPokedexScreenList();
    this._isCurrentPokedexScreenlList = true;
    this._notificationService = notificationService;
    this._textToSpeechService = TTSService;
    this._pokemonApiService = pokemonApiService;
    this._spriteIdx = 0;
    this._hasAnimationLedPlayed = false;
    this._hasAnimationTTSPlayed = false;
  }

  // E v e n t: L i f e C y c l e

  public ngOnInit(): void {
    this._subscriptions = [
      this._pokemonApiService.getObsPokedexTotal.subscribe(v => this._screenPokedexList.setRealLength = v),
      this._pokemonApiService.getObsPokedexList.subscribe(v => this.updatePokedexScreenList(v)),
      this._pokemonApiService.getObsPokemonListByPokedexId.subscribe(v => this.updatePokemonScreenListByPokedex(v)),
      this._textToSpeechService.getObsSpeak.subscribe(v => this._hasAnimationTTSPlayed = v)
    ];
  }

  public ngOnDestroy() {
    this._subscriptions.forEach(v => v.unsubscribe());
  }

  // E v e n t: U I

  public onClickBtnLeftCross(btnName: string): void {
    this.onPlayLedAnimation();
    switch (btnName) {
      case "top":
        this._spriteIdx = 0;
        this.getCurrScreenList.onPrevious();
        break;
      case "bot":
        this._spriteIdx = 0;
        this.getCurrScreenList.onNext();
        break;
      case "left":
        if (this.getSelectedPokemon)
          this._spriteIdx = this._spriteIdx <= 0 ? (this.getSelectedPokemon.sprite.length - 1) : this._spriteIdx - 1;
        break;
      case "right":
        if (this.getSelectedPokemon)
          this._spriteIdx = this._spriteIdx >= (this.getSelectedPokemon.sprite.length - 1) ? 0 : this._spriteIdx + 1;
        break;
    }
  }

  public onClickBtnTTS(rightScreenInformationText: HTMLElement) {
    if (this._textToSpeechService.isAvailable && !this._textToSpeechService.speaks(rightScreenInformationText.querySelectorAll("p")))
      this._notificationService.addWarn("Aie! No text was found...");
  }

  public onClickBtnRight(): void {
    this.onPlayLedAnimation();
    this._notificationService.addWarn("Aie! This button has not action available 😿 (unused)")
  }

  public onChangeScreenList(backToPokedexList: boolean = !this._isCurrentPokedexScreenlList): void {
    this.onPlayLedAnimation();
    this._isCurrentPokedexScreenlList = backToPokedexList;
    if (!this._isCurrentPokedexScreenlList)
      this.initializePokemonScreenList(this.getSelectedPokedex);
  }

  public onScrollScreenList(event: Event) {
    event.preventDefault();
    this.onPlayLedAnimation();
    this.getCurrScreenList.onScroll((event as WheelEvent).deltaY)
  }

  public onPlayLedAnimation(): void {
    if (!this._hasAnimationLedPlayed) {
      this._hasAnimationLedPlayed = true;
      setTimeout(() => this._hasAnimationLedPlayed = false, 1200);
    }
  }

  // M e t h o d 

  private createPokemonScreenList(pokedex: PokedexParsed): ScreenListController<PokemonSpeciesParsed> {
    let sc = new ScreenListController<PokemonSpeciesParsed>(PokedexBase.ITEM_DISPLAYED_SCREEN_LIST, true, false);
    sc.setRealLength = pokedex.pokemon.length;
    sc.setFuncAppendData = (start, end) => this._pokemonApiService.fetchPokemonList(pokedex, start, end);
    sc.setFuncAppendUnloadedItem = () => {
      return {
        id: -1,
        name: { fr: "chargement...", en: "loading..." },
        desc: { fr: "chargement...", en: "loading..." },
        height: -1,
        weight: -1,
        sprite: [],
        types: "???"
      };
    };
    return sc;
  }

  private createPokedexScreenList(): ScreenListController<PokedexParsed> {
    let sc = new ScreenListController<PokedexParsed>(PokedexBase.ITEM_DISPLAYED_SCREEN_LIST, false, false);
    sc.setRealLength = 10;
    sc.setFuncAppendUnloadedItem = () => {
      return {
        id: -1,
        desc: { fr: "chargement...", en: "loading..." },
        name: { fr: "chargement...", en: "loading..." },
        pokemon: []
      };
    }
    return sc;
  }

  private updatePokedexScreenList(allPokedexParsed: PokedexParsed[]) {
    this._screenPokedexList.setRealLength = allPokedexParsed.length > this._screenPokedexList.getRealLength ? allPokedexParsed.length : this._screenPokedexList.getRealLength;
    this._screenPokedexList.setList = allPokedexParsed;
    this._screenPokedexList.setInitialized = true;
    allPokedexParsed.forEach(pokedex => {
      // create pokemon screen list for this pokedex
      if (!this._allScreenPokemonList.has(pokedex.id.toString()))
        this._allScreenPokemonList.set(pokedex.id.toString(), this.createPokemonScreenList(pokedex));
    });
  }

  private updatePokemonScreenListByPokedex(pokemonListByPokedexId: { [id: string]: PokemonSpeciesParsed[] }) {
    Object.keys(pokemonListByPokedexId).forEach(id => {
      if (this._allScreenPokemonList.has(id))
        this._allScreenPokemonList.get(id)!.setList = pokemonListByPokedexId[id];
      else
        console.error(`NullPointer: missing ScreenListController for pokedex: ${id}`);
    });
  }

  private initializePokemonScreenList(pokedex: PokedexParsed): void {
    let screenPokemonForThisPokedex = this._allScreenPokemonList.get(pokedex.id.toString());
    if (screenPokemonForThisPokedex && !screenPokemonForThisPokedex.isInitialized) {
      screenPokemonForThisPokedex.setInitialized = true;
      this._pokemonApiService.fetchPokemonList(pokedex, 0, screenPokemonForThisPokedex.getMaxItemDisplayed * 2);
    }
  }

  // G e t t e r

  public get isCurrentPokedexScreenlList(): boolean {
    return this._isCurrentPokedexScreenlList;
  }

  public get getPokedexList(): PokedexParsed[] {
    return this._screenPokedexList.getList;
  }

  public get getSelectedPokedex(): PokedexParsed {
    return this._screenPokedexList.getSelectedItem;
  }

  public get getSelectedPokemon(): PokemonSpeciesParsed {
    return this.getCurrScreenListPokemon.getSelectedItem;
  }

  public get getSelectedPokemonList(): PokemonSpeciesParsed[] {
    return this.getCurrScreenListPokemon.getList;
  }

  public get getCurrScreenList(): ScreenListController<PokedexParsed> | ScreenListController<PokemonSpeciesParsed> {
    return this._isCurrentPokedexScreenlList ? this._screenPokedexList : this.getCurrScreenListPokemon;
  }

  private get getCurrScreenListPokemon(): ScreenListController<PokemonSpeciesParsed> {
    if (this.getSelectedPokedex && this._allScreenPokemonList.has(this.getSelectedPokedex.id.toString()))
      return this._allScreenPokemonList.get(this.getSelectedPokedex.id.toString())!;
    throw new Error(`NullPointerException pokedex, name: ${this.getSelectedPokedex.name} id: ${this.getSelectedPokedex.id}`)
  }

  public get getNextSprite(): string | null {
    return this.getSelectedPokemon != null ? this.getSelectedPokemon.sprite[this._spriteIdx] : null
  }

  public get hasAnimationLedPlayed(): boolean {
    return this._hasAnimationLedPlayed;
  }

  public get hasAnimationTTSPlayed(): boolean {
    return this._hasAnimationTTSPlayed;
  }

  public get getLang() {
    return LangSwitchComponent.getCurrentLang().code as "fr" | "en"
  }

}

export class ScreenListController<T> {
  private readonly _maxItemDisplayed: number;
  private readonly _enabledFeatureRequestData: boolean;
  private _selectorIdx: number;
  private _list: T[];
  private _initialized: boolean;
  private _initializedItem: number;
  private _realLength: number;
  private _requestedData: boolean;
  private _appendData: (start: number, end: number) => void = () => { throw new Error("not implemented") };
  private _appendUnloadedItem: () => T = () => { throw new Error("not implemented") };

  public constructor(maxItemDisplayed: number, enabledFeatureRequestData: boolean, initialized: boolean) {
    this._maxItemDisplayed = maxItemDisplayed;
    this._enabledFeatureRequestData = enabledFeatureRequestData;
    this._selectorIdx = 0;
    this._list = [];
    this._initialized = initialized;
    this._realLength = 0;
    this._initializedItem = 0;
    this._requestedData = false;
  }

  public onScroll(deltaY: number) {
    if (deltaY > 0) this.onNext();
    else this.onPrevious();
  }

  public onNext() {
    if (this._list.length > 0 && this._selectorIdx < this._list.length - 1) {
      this._selectorIdx++;
      this.checkIfNeedFetchData();
    }
  }

  public onPrevious() {
    if (this._list.length > 0 && this._selectorIdx > 0) {
      this._selectorIdx--;
      this.checkIfNeedFetchData();
    }
  }

  private checkIfNeedFetchData() {
    if (this._enabledFeatureRequestData
      && !this._requestedData
      && (this._selectorIdx == (this._initializedItem - 1) - this.getMaxItemDisplayed)
    ) {
      console.debug("sc request data")
      this._requestedData = true;
      this._appendData(this._initializedItem, this._initializedItem + this.getMaxItemDisplayed * 2);
    }
  }

  // S e t t e r 

  //public set setList(list: T[]) { this._list = list; }

  public set setList(list: T[]) {
    this._initializedItem = 0;
    this._list = [];
    const copyOfFakeData = this._appendUnloadedItem();
    for (let i = 0; i < this._realLength; i++) {
      const item = list[i];
      if (item) {
        this._list.push(item);
        this._initializedItem++;
      } else {
        this._list.push(copyOfFakeData);
      }
    }
    this._requestedData = false;
  }

  public set setInitialized(initialized: boolean) {
    this._initialized = initialized;
  }

  public set setRealLength(length: number) {
    this._realLength = length;
  }

  public set setFuncAppendData(fn: (start: number, end: number) => void) {
    this._appendData = fn;
  }

  public set setFuncAppendUnloadedItem(v: () => T) {
    this._appendUnloadedItem = v;
  }

  // G e t t e r

  public get getRealLength(): number {
    return this._realLength;
  }

  public get getList(): T[] {
    return this._list;
  }

  public get getSelectedItem(): T {
    return this._list[this.getSelectorIndex];
  }

  public get getSelectorIndex(): number {
    return this._selectorIdx;
  }

  public get getEndIndex(): number {
    return this.getStartIndex + this._maxItemDisplayed;
  }

  public get getStartIndex(): number {
    return this._selectorIdx - (this._selectorIdx % this._maxItemDisplayed);
  }

  public get getMaxItemDisplayed(): number {
    return this._maxItemDisplayed;
  }

  public get isInitialized(): boolean {
    return this._initialized;
  }

}
