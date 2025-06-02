const template = document.createElement('template');
template.innerHTML = `
  <style>
    section {
      height: 40%
      width: 100%;

      background-color: #323232;
    }
    svg {
      width: 100%;
      height: 40%;
      border: 1px solid #ccc;
      user-select: none;
    }
    polygon {
      fill: rgba(100, 149, 237, 0.6);
      stroke: #6495ed;
      stroke-width: 2;
      cursor: pointer;
      transition: fill 0.3s;
    }
    polygon:hover {
      fill: rgba(100, 149, 237, 0.9);
    }
  </style>
  <section> 
    <svg></svg>
  </section>

`;

export class BufferZone extends HTMLElement {
  private svg!: SVGSVGElement;

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    this.shadowRoot!.appendChild(
      template.content.cloneNode(true)
    );

    this.svg = this.shadowRoot!.querySelector('svg')!;
  }

  public createRandomPolygon() {
    const polygon = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'polygon'
    );
    polygon.setAttribute('points', '50,10 90,80 10,80');
    polygon.setAttribute('fill', 'blue');
    polygon.setAttribute('stroke', 'black');
    polygon.setAttribute('stroke-width', '2');
    this.svg.appendChild(polygon);
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

customElements.define('buffer-zone', BufferZone);
