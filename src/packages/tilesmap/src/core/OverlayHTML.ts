export class Overlay {

    private _overlay: HTMLElement;

    constructor(htmlStringIdentifier: string) {
        this._overlay = document.getElementById(htmlStringIdentifier);
        this._overlay.style.display = "none";
        let btnClose = (this._overlay.querySelector(".btnCloseOverlay") as HTMLButtonElement);

        if (btnClose) {
            btnClose.onclick = () => this._overlay.style.display = "none";
        } else {
            throw new Error("NullPointerException: querySelection return null, add class .btnCloseOverlay to button or other");
        }
    }

    onOpenClose(onOpenCallback: () => any) {
        if (this._overlay.style.display == "none") {
            onOpenCallback();
            this._overlay.style.display = "block";
        } else {
            this._overlay.style.display = "none";
        }
    }
}
