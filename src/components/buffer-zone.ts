const template = document.createElement('template');
template.innerHTML = `
  <style>
    section {

      height: 40vh;
      width: 100%;

      margin-top: 1rem;

      background-color: #323232;
    }
    svg {
      width: 100%;
      height: 100%;
      border: 1px solid #ccc;
      user-select: none;
    }
    polygon {
      fill: rgba(142, 0, 38, 0.6);
      stroke: #8e0026;
      stroke-width: 2;
      cursor: pointer;
      transition: fill 0.3s;
    }
    polygon:hover {
      fill: #8e0026;
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
    const svgWidth = this.svg.clientWidth || 400;
    const svgHeight = this.svg.clientHeight || 400;

    const margin = 50;
    const centerX = this.randomFloat(margin, svgWidth - margin);
    const centerY = this.randomFloat(margin, svgHeight - margin);

    const vertexCount = this.randomInt(3, 5);

    const angleStep = (2 * Math.PI) / vertexCount;
    const angles: number[] = [];
    for (let i = 0; i < vertexCount; i++) {
      const randomOffset =
        (Math.random() - 0.5) * angleStep * 0.3;
      angles.push(i * angleStep + randomOffset);
    }

    const minRadius = 20;
    const maxRadius = 50;

    const points: string[] = angles.map((angle) => {
      const radius = this.randomFloat(minRadius, maxRadius);
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    });

    const polygon = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'polygon'
    );
    polygon.setAttribute('points', points.join(' '));
    polygon.setAttribute('fill', 'rgba(100, 149, 237, 0.6)');
    polygon.setAttribute('stroke', '#6495ed');
    polygon.setAttribute('stroke-width', '2');

    polygon.addEventListener('click', () => polygon.remove());

    this.svg.appendChild(polygon);
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private randomFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }
}

customElements.define('buffer-zone', BufferZone);
