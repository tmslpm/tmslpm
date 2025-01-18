import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { LangSwitchComponent } from "../views/components/switch-lang/switch-lang.component";

@Injectable({ providedIn: "root" })
export class TextToSpeechService {
  private readonly _speak: BehaviorSubject<boolean>;
  private readonly _obsSpeak: Observable<boolean>;

  private _voice: SpeechSynthesisVoice | null;
  private _pitch: number;
  private _rate: number;

  public constructor() {
    this._speak = new BehaviorSubject<boolean>(false);
    this._obsSpeak = this._speak.asObservable();
    this._voice = null;
    this._pitch = 1;
    this._rate = 0.85;
    if (window.speechSynthesis && window.speechSynthesis.onvoiceschanged !== undefined)
      window.speechSynthesis.onvoiceschanged = () => this.trySetupVoice(LangSwitchComponent.getCurrentLang().locale);
    else
      console.warn("TTS is not available:", window.speechSynthesis, window.speechSynthesis.onvoiceschanged);
  }

  public speaks(allParagraph: NodeListOf<HTMLParagraphElement>): boolean {
    if (!this.isAvailable)
      return false;

    let textFound = false;
    let promises: Promise<void>[] = [];

    allParagraph.forEach((paragraph, i) => {
      if (paragraph.textContent) {
        textFound = true;
        this._speak.next(true);
        promises.push(this.speak(paragraph.textContent));
      }
    });

    Promise.all(promises).then(() => this._speak.next(false))
    return textFound;
  }

  private trySetupVoice(localLang: string): void {
    let voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      // try get local google voice
      let tryGetGoogleVoice = voices.filter(v => v.name.toLowerCase().includes("google") || v.voiceURI.toLowerCase().includes("google"))
      if (tryGetGoogleVoice.length > 0) {
        let tryFindLocalGoogleVoice = tryGetGoogleVoice.find(v => v.lang.includes(localLang));
        if (tryFindLocalGoogleVoice) {
          this._voice = tryFindLocalGoogleVoice;
          return;
        }
      }

      // not found local voice.. try get other voice
      let tryGetOtherLocalVoice = voices.find(v => v.lang.includes(localLang));
      if (tryGetOtherLocalVoice) {
        this._voice = tryGetOtherLocalVoice;
        return;
      }

      // not found local voice in list try get default voice
      let tryGetDefaultVoice = voices.find(v => v.default);
      if (tryGetDefaultVoice) {
        this._voice = tryGetDefaultVoice;
      }
    }
  }

  private speak(text: string): Promise<void> {
    return new Promise((resolve) => {
      let speechSynthesisUtterance = new SpeechSynthesisUtterance(text);
      speechSynthesisUtterance.voice = this._voice;
      speechSynthesisUtterance.pitch = this._pitch;
      speechSynthesisUtterance.rate = this._rate;
      speechSynthesisUtterance.onend = () => resolve();
      speechSynthesisUtterance.onerror = () => resolve();
      window.speechSynthesis.speak(speechSynthesisUtterance);
    });
  }

  // G e t t e r - S e t t e r

  public get getObsSpeak(): Observable<boolean> {
    return this._obsSpeak;
  }

  public get isAvailable(): boolean {
    return this._voice != null;
  }

}
