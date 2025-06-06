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
      display: block;
      user-select: none;
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
    }
  </style>
  <section>
    <svg>
      <g class="grid"></g>
      <g class="content"></g>
      <g class="axes"></g>
    </svg>
  </section>
`;

export class WorkZone extends HTMLElement {
  private svg!: SVGSVGElement;
  private gridGroup!: SVGGElement;
  private contentGroup!: SVGGElement;
  private axesGroup!: SVGGElement;

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

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));

    this.svg = this.shadowRoot!.querySelector('svg')!;
    this.gridGroup = this.svg.querySelector('g.grid')!;
    this.contentGroup = this.svg.querySelector('g.content')!;
    this.axesGroup = this.svg.querySelector('g.axes')!;
  }

  connectedCallback() {
    this.updateSize();
    window.addEventListener('resize', this.updateSize);
    this.svg.addEventListener('wheel', this.handleWheel, { passive: false });
    this.svg.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mouseup', this.handleMouseUp);
    window.addEventListener('mousemove', this.handleMouseMove);

    this.render();
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this.updateSize);
    this.svg.removeEventListener('wheel', this.handleWheel);
    this.svg.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mouseup', this.handleMouseUp);
    window.removeEventListener('mousemove', this.handleMouseMove);
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
    this.updateContentTransform();
  }

  private renderGrid() {
    while (this.gridGroup.firstChild) {
      this.gridGroup.removeChild(this.gridGroup.firstChild);
    }

    const step = 10 * this.scale;

    // Рассчитываем видимую область в координатах с учётом смещения и масштаба
    const startX = -this.offsetX / this.scale;
    const endX = startX + this.width / this.scale;
    const startY = -this.offsetY / this.scale;
    const endY = startY + this.height / this.scale;

    // Вертикальные линии сетки
    for (let x = Math.floor(startX / 10) * 10; x <= endX; x += 10) {
      const screenX = this.offsetX + x * this.scale;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', `${screenX}`);
      line.setAttribute('y1', '0');
      line.setAttribute('x2', `${screenX}`);
      line.setAttribute('y2', `${this.height}`);
      line.setAttribute('class', 'grid-line');
      this.gridGroup.appendChild(line);
    }

    // Горизонтальные линии сетки
    for (let y = Math.floor(startY / 10) * 10; y <= endY; y += 10) {
      const screenY = this.offsetY + y * this.scale;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', '0');
      line.setAttribute('y1', `${screenY}`);
      line.setAttribute('x2', `${this.width}`);
      line.setAttribute('y2', `${screenY}`);
      line.setAttribute('class', 'grid-line');
      this.gridGroup.appendChild(line);
    }
  }

  private renderAxes() {
    while (this.axesGroup.firstChild) {
      this.axesGroup.removeChild(this.axesGroup.firstChild);
    }

    // Ось X (внизу)
    const axisX = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    axisX.setAttribute('x1', '0');
    axisX.setAttribute('y1', `${this.height - 1}`);
    axisX.setAttribute('x2', `${this.width}`);
    axisX.setAttribute('y2', `${this.height - 1}`);
    axisX.setAttribute('class', 'axis-line');
    this.axesGroup.appendChild(axisX);

    // Ось Y (слева)
    const axisY = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    axisY.setAttribute('x1', '1');
    axisY.setAttribute('y1', '0');
    axisY.setAttribute('x2', '1');
    axisY.setAttribute('y2', `${this.height}`);
    axisY.setAttribute('class', 'axis-line');
    this.axesGroup.appendChild(axisY);

    // Деления и подписи по X (внизу)
    for (let x = 0; x <= this.width; x += 10 * this.scale) {
      const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      tick.setAttribute('x1', `${x}`);
      tick.setAttribute('y1', `${this.height - 1}`);
      tick.setAttribute('x2', `${x}`);
      tick.setAttribute('y2', `${this.height - 1 + 6}`);
      tick.setAttribute('stroke', '#333');
      tick.setAttribute('stroke-width', '1');
      this.axesGroup.appendChild(tick);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', `${x}`);
      text.setAttribute('y', `${this.height - 1 + 18}`);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('class', 'tick-text');
      text.textContent = Math.round(x / this.scale).toString();
      this.axesGroup.appendChild(text);
    }

    // Деления и подписи по Y (слева)
    for (let y = 0; y <= this.height; y += 10 * this.scale) {
      const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      tick.setAttribute('x1', '1');
      tick.setAttribute('y1', `${y}`);
      tick.setAttribute('x2', `${1 - 6}`);
      tick.setAttribute('y2', `${y}`);
      tick.setAttribute('stroke', '#333');
      tick.setAttribute('stroke-width', '1');
      this.axesGroup.appendChild(tick);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', `${1 - 10}`);
      text.setAttribute('y', `${y + 3}`);
      text.setAttribute('text-anchor', 'end');
      text.setAttribute('class', 'tick-text');
      text.textContent = Math.round(y / this.scale).toString();
      this.axesGroup.appendChild(text);
    }
  }

  private updateContentTransform() {
    const transform = `translate(${this.offsetX}, ${this.offsetY}) scale(${this.scale})`;
    this.contentGroup.setAttribute('transform', transform);
  }

  private handleWheel = (event: WheelEvent) => {
    event.preventDefault();
  
    const { offsetX, offsetY, deltaY } = event;
  
    // Координаты мыши в системе координат SVG до масштабирования
    const svgPointX = (offsetX - this.offsetX) / this.scale;
    const svgPointY = (offsetY - this.offsetY) / this.scale;
  
    // Изменяем масштаб
    const scaleFactor = deltaY < 0 ? 1.1 : 0.9;
    let newScale = this.scale * scaleFactor;
  
    // Ограничиваем масштаб
    newScale = Math.min(this.maxScale, Math.max(this.minScale, newScale));
  
    // Корректируем смещение, чтобы масштабирование было относительно мыши
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

  public addContentElement(element: SVGElement) {
    this.contentGroup.appendChild(element);
  }
}

customElements.define('work-zone', WorkZone);
