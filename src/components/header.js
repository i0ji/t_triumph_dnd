// header-component.js

const template = document.createElement('template');
template.innerHTML = `
  <style>
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background-color: #2c3e50;
      padding: 10px 20px;
      color: white;
      font-family: Arial, sans-serif;
    }
    .logo {
      font-weight: bold;
      font-size: 1.5em;
    }
    nav {
      display: flex;
      gap: 10px;
    }
    button {
      background-color: #3498db;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      color: white;
      font-size: 1em;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }
    button:hover {
      background-color: #2980b9;
    }
  </style>
  <header>
    <div class="logo"><slot name="logo">Моё Приложение</slot></div>
    <nav>
      <button id="btn1"><slot name="btn1">Кнопка 1</slot></button>
      <button id="btn2"><slot name="btn2">Кнопка 2</slot></button>
      <button id="btn3"><slot name="btn3">Кнопка 3</slot></button>
    </nav>
  </header>
`;

class AppHeader extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    // Пример обработки кликов по кнопкам
    this.shadowRoot.getElementById('btn1').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('button-click', { detail: 'btn1', bubbles: true, composed: true }));
    });
    this.shadowRoot.getElementById('btn2').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('button-click', { detail: 'btn2', bubbles: true, composed: true }));
    });
    this.shadowRoot.getElementById('btn3').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('button-click', { detail: 'btn3', bubbles: true, composed: true }));
    });
  }
}

customElements.define('app-header', AppHeader);
