const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: block;
      height: 40vh;
      width: 100%;
      margin-top: 1rem;
      background-color: #323232;
      user-select: none;
      position: relative;
      overflow: hidden;
    }
    svg {
      width: 100%;
      height: 100%;
      display: block;
      background: white;
      cursor: grab;
    }
    svg:active {
      cursor: grabbing;
    }
    .axis-line {
      stroke: #666;
      stroke-width: 1;
    }
    .grid-line {
      stroke: #ddd;
      stroke-width: 1;
    }
    .tick-text {
      font-size: 10px;
      fill: #333;
      user-select: none;
      font-family: sans-serif;
    }
    .polygon {
      fill: rgba(0,0,255,0.2);
      stroke: blue;
      stroke-width: 2;
    }
  </style>
  <svg>
    <g class="content-group">
      <g class="grid"></g>
      <g class="axes"></g>
      <g class="polygons"></g>
    </g>
  </svg>
`;

export class WorkZone extends HTMLElement {
  private svg!: SVGSVGElement;
  private gridGroup!: SVGGElement;
  private axesGroup!: SVGGElement;
  private polygonsGroup!: SVGGElement;

  private width = 0;
  private height = 0;

  private scale = 1;
  private minScale = 0.2;
  private maxScale = 5;

  private offsetX = 0;
  private offsetY = 0;

  private isPanning = false;
  private panStartX = 0;
  private panStartY = 0;
  private panOriginX = 0;
  private panOriginY = 0;

  private polygons: Array<Array<{ x: number; y: number }>> = [];

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));

    this.svg = this.shadowRoot!.querySelector('svg')!;
    this.gridGroup = this.svg.querySelector('g.grid')!;
    this.axesGroup = this.svg.querySelector('g.axes')!;
    this.polygonsGroup = this.svg.querySelector('g.polygons')!;
  }

  connectedCallback() {
    this.updateSize();
    window.addEventListener('resize', this.updateSize);
    this.svg.addEventListener('wheel', this.handleWheel, { passive: false });
    this.svg.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mouseup', this.handleMouseUp);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('polygons-updated', this.handlePolygonsUpdated as EventListener);
    this.render();
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this.updateSize);
    this.svg.removeEventListener('wheel', this.handleWheel);
    this.svg.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mouseup', this.handleMouseUp);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('polygons-updated', this.handlePolygonsUpdated as EventListener);
  }

  private updateSize = () => {
    const rect = this.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.svg.setAttribute('width', `${this.width}`);
    this.svg.setAttribute('height', `${this.height}`);
    this.render();
  };

  private render() {
    this.renderGrid();
    this.renderAxes();
    this.renderPolygons();
    this.updateContentTransform();
  }

  private renderGrid() {
    while (this.gridGroup.firstChild) this.gridGroup.removeChild(this.gridGroup.firstChild);

    const step = 10;
    const startX = -this.offsetX / this.scale;
    const endX = startX + this.width / this.scale;
    const startY = -this.offsetY / this.scale;
    const endY = startY + this.height / this.scale;

    for (let x = Math.floor(startX / step) * step; x <= endX; x += step) {
      const screenX = x;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', `${screenX}`);
      line.setAttribute('y1', `${startY}`);
      line.setAttribute('x2', `${screenX}`);
      line.setAttribute('y2', `${endY}`);
      line.setAttribute('class', 'grid-line');
      this.gridGroup.appendChild(line);
    }

    for (let y = Math.floor(startY / step) * step; y <= endY; y += step) {
      const screenY = y;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', `${startX}`);
      line.setAttribute('y1', `${screenY}`);
      line.setAttribute('x2', `${endX}`);
      line.setAttribute('y2', `${screenY}`);
      line.setAttribute('class', 'grid-line');
      this.gridGroup.appendChild(line);
    }
  }

  private renderAxes() {
    while (this.axesGroup.firstChild) this.axesGroup.removeChild(this.axesGroup.firstChild);

    // Ось X
    const axisX = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    axisX.setAttribute('x1', '-10000');
    axisX.setAttribute('y1', '0');
    axisX.setAttribute('x2', '10000');
    axisX.setAttribute('y2', '0');
    axisX.setAttribute('class', 'axis-line');
    this.axesGroup.appendChild(axisX);

    // Ось Y
    const axisY = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    axisY.setAttribute('x1', '0');
    axisY.setAttribute('y1', '-10000');
    axisY.setAttribute('x2', '0');
    axisY.setAttribute('y2', '10000');
    axisY.setAttribute('class', 'axis-line');
    this.axesGroup.appendChild(axisY);

    // Деления по X
    const step = 10;
    const startX = -this.offsetX / this.scale;
    const endX = startX + this.width / this.scale;
    for (let x = Math.floor(startX / step) * step; x <= endX; x += step) {
      const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      tick.setAttribute('x1', `${x}`);
      tick.setAttribute('y1', '-5');
      tick.setAttribute('x2', `${x}`);
      tick.setAttribute('y2', '5');
      tick.setAttribute('stroke', '#333');
      tick.setAttribute('stroke-width', '1');
      this.axesGroup.appendChild(tick);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', `${x}`);
      text.setAttribute('y', '15');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('class', 'tick-text');
      text.textContent = x.toString();
      this.axesGroup.appendChild(text);
    }

    // Деления по Y
    const startY = -this.offsetY / this.scale;
    const endY = startY + this.height / this.scale;
    for (let y = Math.floor(startY / step) * step; y <= endY; y += step) {
      const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      tick.setAttribute('x1', '-5');
      tick.setAttribute('y1', `${y}`);
      tick.setAttribute('x2', '5');
      tick.setAttribute('y2', `${y}`);
      tick.setAttribute('stroke', '#333');
      tick.setAttribute('stroke-width', '1');
      this.axesGroup.appendChild(tick);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', '-8');
      text.setAttribute('y', `${y + 4}`);
      text.setAttribute('text-anchor', 'end');
      text.setAttribute('class', 'tick-text');
      text.textContent = y.toString();
      this.axesGroup.appendChild(text);
    }
  }

  private renderPolygons() {
    while (this.polygonsGroup.firstChild) this.polygonsGroup.removeChild(this.polygonsGroup.firstChild);

    for (const polygon of this.polygons) {
      const svgPolygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      svgPolygon.setAttribute('points', polygon.map(p => `${p.x},${p.y}`).join(' '));
      svgPolygon.setAttribute('class', 'polygon');
      this.polygonsGroup.appendChild(svgPolygon);
    }
  }

  private updateContentTransform() {
    const contentGroup = this.svg.querySelector('g.content-group')!;
    contentGroup.setAttribute('transform', `translate(${this.offsetX},${this.offsetY}) scale(${this.scale})`);
  }

  private handleWheel = (event: WheelEvent) => {
    event.preventDefault();
    const { offsetX, offsetY, deltaY } = event;
    const svgPointX = (offsetX - this.offsetX) / this.scale;
    const svgPointY = (offsetY - this.offsetY) / this.scale;
    const scaleFactor = deltaY < 0 ? 1.1 : 0.9;
    let newScale = this.scale * scaleFactor;
    newScale = Math.min(this.maxScale, Math.max(this.minScale, newScale));
    this.offsetX = offsetX - svgPointX * newScale;
    this.offsetY = offsetY - svgPointY * newScale;
    this.scale = newScale;
    this.render();
  };

  private handleMouseDown = (event: MouseEvent) => {
    if (event.button !== 0) return;
    this.isPanning = true;
    this.panStartX = event.clientX;
    this.panStartY = event.clientY;
    this.panOriginX = this.offsetX;
    this.panOriginY = this.offsetY;
  };

  private handleMouseMove = (event: MouseEvent) => {
    if (!this.isPanning) return;
    const dx = event.clientX - this.panStartX;
    const dy = event.clientY - this.panStartY;
    this.offsetX = this.panOriginX + dx;
    this.offsetY = this.panOriginY + dy;
    this.render();
  };

  private handleMouseUp = (event: MouseEvent) => {
    if (event.button !== 0) return;
    this.isPanning = false;
  };

  private handlePolygonsUpdated = (event: Event) => {
    const customEvent = event as CustomEvent;
    this.polygons = customEvent.detail;
    this.renderPolygons();
  };
}

customElements.define('work-zone', WorkZone);
