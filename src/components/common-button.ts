const template = document.createElement('template');
template.innerHTML = `
  <style>
    button {
      background-color: #969696;
      border: none;
      color: #323232;
      padding: 10px 20px;
      font-size: 16px;
      font-weight: bold;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }
    button:hover {
      background-color: #8e0026;
      color: #969696;
    }
  </style>
  <button><slot>Действие</slot></button>
`;

type ButtonMode = 'create' | 'save' | 'clear';

export class CommonButton extends HTMLElement {
  private button!: HTMLButtonElement;
  private _mode: ButtonMode = 'create';

  static get observedAttributes() {
    return ['mode'];
  }

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(template.content.cloneNode(true));
    this.button = shadow.querySelector('button')!;
  }

  connectedCallback() {
    this.updateButtonText();
    this.button.addEventListener('click', this.handleClick);
  }

  disconnectedCallback() {
    this.button.removeEventListener('click', this.handleClick);
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null
  ) {
    if (name === 'mode' && newValue !== oldValue) {
      if (this.isValidMode(newValue)) {
        this._mode = newValue as ButtonMode;
        this.updateButtonText();
      } else {
        console.warn(`Invalid mode value: ${newValue}`);
      }
    }
  }

  // Свойство для удобного доступа к mode
  get mode(): ButtonMode {
    return this._mode;
  }

  set mode(value: ButtonMode) {
    if (this.isValidMode(value)) {
      this._mode = value;
      this.setAttribute('mode', value);
      this.updateButtonText();
    } else {
      throw new Error(`Invalid mode value: ${value}`);
    }
  }

  private isValidMode(value: string | null): value is ButtonMode {
    return value === 'create' || value === 'save' || value === 'clear';
  }

  private updateButtonText() {
    switch (this._mode) {
      case 'create':
        this.button.textContent = 'Создать';
        break;
      case 'save':
        this.button.textContent = 'Сохранить';
        break;
      case 'clear':
        this.button.textContent = 'Сбросить';
        break;
      default:
        this.button.textContent = '-';
    }
  }

  private handleClick = () => {
    this.dispatchEvent(
      new CustomEvent(`common-button-${this._mode}`, {
        bubbles: true,
        composed: true,
      })
    );
  };
}

customElements.define('common-button', CommonButton);
