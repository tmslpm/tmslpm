export class MenuEditor {
    private menuContainer: HTMLElement;

    constructor(htmlStringIdentifier: string) {
        this.menuContainer = document.getElementById(htmlStringIdentifier);
        this.menuContainer.innerHTML = "";
    }

    addLargeButton(text: string, onClickCallback: (btn: HTMLButtonElement) => any): HTMLButtonElement {
        return this.addButton(text, onClickCallback, true);
    }

    addButtonIcon(pathIcon: string, description: string, size: number, classGroup: string, onClickCallback: (btn: HTMLImageElement) => any, selected = false): HTMLImageElement {
        let btn = document.createElement("img"); 
        btn.classList.add("buttonIcon", classGroup);
        if (selected) btn.classList.add("selected");
        btn.width = size;
        btn.height = size;
        btn.src = pathIcon;
        btn.alt = description;
        btn.onclick = () => onClickCallback(btn);
        this.menuContainer.appendChild(btn); 
        return btn;
    }

    addButton(text: string, onClickCallback: (btn: HTMLButtonElement) => any, isLarge = false): HTMLButtonElement {
        let wrapperBtn = document.createElement("div");
        wrapperBtn.className = "wrapperElement";
        wrapperBtn.style.width = isLarge ? "100%" : "50%";

        let btn = document.createElement("button");
        btn.innerText = text;
        btn.onclick = () => onClickCallback(btn);
        wrapperBtn.appendChild(btn);

        this.menuContainer.appendChild(wrapperBtn);
        return btn;
    }

    addBtnFile(text: string, isLarge = false, onChangeCallback: (fileList: FileList) => any): HTMLButtonElement {
        let hiddenInput = document.createElement("input");
        hiddenInput.type = "file";
        hiddenInput.style.visibility = "hidden";
        hiddenInput.style.height = "0px";
        hiddenInput.style.position = "absolute";
        hiddenInput.onchange = (_) => {
            onChangeCallback(hiddenInput.files)
            hiddenInput.value = null;
        };
        this.menuContainer.appendChild(hiddenInput); 
        let btn = this.addButton(text, () => hiddenInput.click(), isLarge)
        return btn;
    }

    addInputNumber(text: string, initialValue: number, min: number, max: number, step: number, onChangeCallback: (value: string) => any): HTMLInputElement {
        let input = this.addInput(text, "number", initialValue.toString(), onChangeCallback);
        input.min = min.toString();
        input.max = max.toString();
        input.step = step.toString();
        return input;
    }

    addInput(text: string, type = "text", initialValue: string, onChangeCallback: (value: string) => any): HTMLInputElement {
        let wrapperInput = document.createElement("div");
        wrapperInput.className = "wrapperElement";

        let label = document.createElement("div") as HTMLDivElement;
        label.innerHTML = `<div>${text}:</div>`;
        label.classList.add("labelInput");
        wrapperInput.appendChild(label);

        let input = document.createElement("input") as HTMLInputElement;
        input.type = type;
        input.value = initialValue;
        input.onchange = () => onChangeCallback(input.value);
        wrapperInput.appendChild(input);

        this.menuContainer.appendChild(wrapperInput);
        return input;
    }

    addSubMenu(text: string): MenuEditor {
        let wrapperContent = document.createElement("div");
        wrapperContent.className = "wrapperElement";

        let subMenuClass = "submenu"
        let identifier = "sub_menu_editor_" + this.menuContainer.querySelectorAll(`.${subMenuClass}`).length;
        let wrapperSubMenu = document.createElement("div");
        wrapperSubMenu.id = identifier;
        wrapperSubMenu.classList.add(subMenuClass, "wrapperSubmenu");
        wrapperSubMenu.style.display = "none";

        this.addLargeButton(text, () => {
            let v = wrapperSubMenu.style.display == "block" ? "none" : "block";
            this.menuContainer.querySelectorAll<HTMLDivElement>(`.${subMenuClass}`).forEach(v => v.style.display = "none");
            wrapperSubMenu.style.display = v;
        });

        wrapperContent.appendChild(wrapperSubMenu);
        this.menuContainer.appendChild(wrapperContent); 
        return new MenuEditor(identifier);
    }

    appendOther(element: HTMLElement): void {
        let wrapperInput = document.createElement("div");
        wrapperInput.className = "wrapperElement";
        wrapperInput.appendChild(element);
        this.menuContainer.appendChild(wrapperInput);
    }

    appendEmptyWrapper(htmlStringIdentifier: string): void {
        let wrapperInput = document.createElement("div");
        wrapperInput.className = "wrapperElement";
        wrapperInput.style.position = "relative";
        wrapperInput.id = htmlStringIdentifier;
        this.menuContainer.appendChild(wrapperInput);
    }

}
