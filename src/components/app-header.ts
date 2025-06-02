const template = document.createElement('template');
template.innerHTML = `
  <style>
    header {
      display: flex;
      align-items: center;

      padding: 1%;


      background-color: #323232;
      color: white;

      font-family: Arial, sans-serif;
    }
    nav {
      display: flex;
      align-items: center;
      justify-content: space-between;

      width: 100%;
    }
  </style>
  <header>
    <nav>
      <common-button mode="create"></common-button>
      <div> 
        <common-button mode="save"></common-button>
        <common-button mode="clear"></common-button>
      </div>
    </nav>
  </header>
`;

export class Header extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot!.appendChild(
      template.content.cloneNode(true)
    );
  }
}

customElements.define('app-header', Header);
