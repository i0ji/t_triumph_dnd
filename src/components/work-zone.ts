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
    section {
      width: 100%;
      height: 100%;
      position: relative;
    }
    svg {
      width: 100%;
      height: 100%;
      display: block;
      background: white;
    }
    .axis-line {
      stroke: #666;
      stroke-width: 1;
    }
    .grid-line {
      stroke: #ddd;
      stroke-width: 1;
    }
      .axis-line,
.tick-line {
  stroke-width: 10;
  vector-effect: non-scaling-stroke;
}

    .tick-text {
      font-size: 10px;
      fill: #333;
      user-select: none;
      font-family: sans-serif;
    }
  </style>
  <section>
    <svg>
      <!-- Масштабируемая и сдвигаемая группа с сеткой и содержимым -->
      <g class="content-group">
        <g class="grid"></g>
        <g class="content"></g>
      </g>
      <!-- Фиксированные оси и шкалы -->
      <g class="axes-fixed"></g>
    </svg>
  </section>
`;

export class WorkZone extends HTMLElement {
  private svg!: SVGSVGElement;
  private contentGroup!: SVGGElement;
  private gridGroup!: SVGGElement;
  private axesFixedGroup!: SVGGElement;

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
    this.shadowRoot!.appendChild(
      template.content.cloneNode(true)
    );

    this.svg = this.shadowRoot!.querySelector('svg')!;
    this.contentGroup = this.svg.querySelector('g.content')!;
    this.gridGroup = this.svg.querySelector('g.grid')!;
    this.axesFixedGroup =
      this.svg.querySelector('g.axes-fixed')!;
  }

  connectedCallback() {
    this.updateSize();
    window.addEventListener('resize', this.updateSize);
    this.svg.addEventListener('wheel', this.handleWheel, {
      passive: false,
    });
    this.svg.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mouseup', this.handleMouseUp);
    window.addEventListener('mousemove', this.handleMouseMove);
    this.render();
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this.updateSize);
    this.svg.removeEventListener('wheel', this.handleWheel);
    this.svg.removeEventListener(
      'mousedown',
      this.handleMouseDown
    );
    window.removeEventListener('mouseup', this.handleMouseUp);
    window.removeEventListener(
      'mousemove',
      this.handleMouseMove
    );
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
    this.updateContentTransform();
    this.renderFixedAxes();
  }

  // Сетка масштабируется и сдвигается вместе с содержимым
  private renderGrid() {
    while (this.gridGroup.firstChild)
      this.gridGroup.removeChild(this.gridGroup.firstChild);

    const step = 10; // шаг сетки в координатах
    const startX = -this.offsetX / this.scale;
    const endX = startX + this.width / this.scale;
    const startY = -this.offsetY / this.scale;
    const endY = startY + this.height / this.scale;

    for (
      let x = Math.floor(startX / step) * step;
      x <= endX;
      x += step
    ) {
      const screenX = this.offsetX + x * this.scale;
      const line = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'line'
      );
      line.setAttribute('x1', `${screenX}`);
      line.setAttribute('y1', '0');
      line.setAttribute('x2', `${screenX}`);
      line.setAttribute('y2', `${this.height}`);
      line.setAttribute('class', 'grid-line');
      this.gridGroup.appendChild(line);
    }

    for (
      let y = Math.floor(startY / step) * step;
      y <= endY;
      y += step
    ) {
      const screenY = this.offsetY + y * this.scale;
      const line = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'line'
      );
      line.setAttribute('x1', '0');
      line.setAttribute('y1', `${screenY}`);
      line.setAttribute('x2', `${this.width}`);
      line.setAttribute('y2', `${screenY}`);
      line.setAttribute('class', 'grid-line');
      this.gridGroup.appendChild(line);
    }
  }

  private updateContentTransform() {
    const contentGroup = this.svg.querySelector(
      'g.content-group'
    )!;
    contentGroup.setAttribute(
      'transform',
      `translate(${this.offsetX}, ${this.offsetY}) scale(${this.scale})`
    );
  }

  // Фиксированные оси и шкалы слева и снизу, не масштабируются и не двигаются
  private renderFixedAxes() {
    while (this.axesFixedGroup.firstChild)
      this.axesFixedGroup.removeChild(
        this.axesFixedGroup.firstChild
      );

    const axisThickness = 40; // ширина/высота осей в px
    const stepPx = 10; // шаг делений в пикселях (фиксирован)

    // Фон осей
    const axisYBg = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'rect'
    );
    axisYBg.setAttribute('x', '0');
    axisYBg.setAttribute('y', '0');
    axisYBg.setAttribute('width', `${axisThickness}`);
    axisYBg.setAttribute('height', `${this.height}`);
    axisYBg.setAttribute('fill', '#f0f0f0');
    this.axesFixedGroup.appendChild(axisYBg);

    const axisXBg = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'rect'
    );
    axisXBg.setAttribute('x', `${axisThickness}`);
    axisXBg.setAttribute('y', `${this.height - axisThickness}`);
    axisXBg.setAttribute(
      'width',
      `${this.width - axisThickness}`
    );
    axisXBg.setAttribute('height', `${axisThickness}`);
    axisXBg.setAttribute('fill', '#f0f0f0');
    this.axesFixedGroup.appendChild(axisXBg);

    // Вертикальная ось (слева)
    const axisLineY = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'line'
    );
    axisLineY.setAttribute('x1', `${axisThickness - 1}`);
    axisLineY.setAttribute('y1', '0');
    axisLineY.setAttribute('x2', `${axisThickness - 1}`);
    axisLineY.setAttribute('y2', `${this.height}`);
    axisLineY.setAttribute('class', 'axis-line');
    this.axesFixedGroup.appendChild(axisLineY);

    // Горизонтальная ось (снизу)
    const axisLineX = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'line'
    );
    axisLineX.setAttribute('x1', `${axisThickness}`);
    axisLineX.setAttribute(
      'y1',
      `${this.height - axisThickness + 1}`
    );
    axisLineX.setAttribute('x2', `${this.width}`);
    axisLineX.setAttribute(
      'y2',
      `${this.height - axisThickness + 1}`
    );
    axisLineX.setAttribute('class', 'axis-line');
    this.axesFixedGroup.appendChild(axisLineX);

    // Деления и подписи по вертикальной оси (слева)
    for (let y = 0; y <= this.height; y += stepPx) {
      if (y > this.height - axisThickness) break;

      const tick = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'line'
      );
      tick.setAttribute('x1', `${axisThickness - 10}`);
      tick.setAttribute('y1', `${y}`);
      tick.setAttribute('x2', `${axisThickness}`);
      tick.setAttribute('y2', `${y}`);
      tick.setAttribute('stroke', '#333');
      tick.setAttribute('stroke-width', '1');
      this.axesFixedGroup.appendChild(tick);

      const text = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'text'
      );
      text.setAttribute('x', `${axisThickness - 12}`);
      text.setAttribute('y', `${y + 4}`);
      text.setAttribute('text-anchor', 'end');
      text.setAttribute('class', 'tick-text');
      text.textContent = `${
        Math.round((this.height - y) / stepPx) * 10
      }`;
      this.axesFixedGroup.appendChild(text);
    }

    // Деления и подписи по горизонтальной оси (снизу)
    for (let x = axisThickness; x <= this.width; x += stepPx) {
      if (x > this.width) break;

      const tick = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'line'
      );
      tick.setAttribute('x1', `${x}`);
      tick.setAttribute('y1', `${this.height - axisThickness}`);
      tick.setAttribute('x2', `${x}`);
      tick.setAttribute(
        'y2',
        `${this.height - axisThickness + 10}`
      );
      tick.setAttribute('stroke', '#333');
      tick.setAttribute('stroke-width', '1');
      this.axesFixedGroup.appendChild(tick);

      const text = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'text'
      );
      text.setAttribute('x', `${x}`);
      text.setAttribute(
        'y',
        `${this.height - axisThickness + 20}`
      );
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('class', 'tick-text');
      text.textContent = `${
        Math.round((x - axisThickness) / stepPx) * 10
      }`;
      this.axesFixedGroup.appendChild(text);
    }
  }

  private handleWheel = (event: WheelEvent) => {
    event.preventDefault();

    const { offsetX, offsetY, deltaY } = event;
    const svgPointX = (offsetX - this.offsetX) / this.scale;
    const svgPointY = (offsetY - this.offsetY) / this.scale;

    const scaleFactor = deltaY < 0 ? 1.1 : 0.9;
    let newScale = this.scale * scaleFactor;
    newScale = Math.min(
      this.maxScale,
      Math.max(this.minScale, newScale)
    );

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

  private renderContent() {
    // Очистка
    while (this.gridGroup.firstChild)
      this.gridGroup.removeChild(this.gridGroup.firstChild);
    while (this.contentGroup.firstChild)
      this.contentGroup.removeChild(
        this.contentGroup.firstChild
      );

    const step = 10; // шаг в логических координатах

    // Рисуем сетку
    const viewWidth = this.width / this.scale;
    const viewHeight = this.height / this.scale;

    for (let x = 0; x <= viewWidth; x += step) {
      const line = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'line'
      );
      line.setAttribute('x1', `${x}`);
      line.setAttribute('y1', '0');
      line.setAttribute('x2', `${x}`);
      line.setAttribute('y2', `${viewHeight}`);
      line.setAttribute('class', 'grid-line');
      this.gridGroup.appendChild(line);
    }

    for (let y = 0; y <= viewHeight; y += step) {
      const line = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'line'
      );
      line.setAttribute('x1', '0');
      line.setAttribute('y1', `${y}`);
      line.setAttribute('x2', `${viewWidth}`);
      line.setAttribute('y2', `${y}`);
      line.setAttribute('class', 'grid-line');
      this.gridGroup.appendChild(line);
    }

    // Рисуем оси (X и Y)
    const axisX = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'line'
    );
    axisX.setAttribute('x1', '0');
    axisX.setAttribute('y1', '0');
    axisX.setAttribute('x2', `${viewWidth}`);
    axisX.setAttribute('y2', '0');
    axisX.setAttribute('class', 'axis-line');
    this.contentGroup.appendChild(axisX);

    const axisY = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'line'
    );
    axisY.setAttribute('x1', '0');
    axisY.setAttribute('y1', '0');
    axisY.setAttribute('x2', '0');
    axisY.setAttribute('y2', `${viewHeight}`);
    axisY.setAttribute('class', 'axis-line');
    this.contentGroup.appendChild(axisY);

    // Деления и подписи по X
    for (let x = 0; x <= viewWidth; x += step) {
      const tick = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'line'
      );
      tick.setAttribute('x1', `${x}`);
      tick.setAttribute('y1', '0');
      tick.setAttribute('x2', `${x}`);
      tick.setAttribute('y2', '5');
      tick.setAttribute('stroke', '#333');
      tick.setAttribute('stroke-width', '1');
      this.contentGroup.appendChild(tick);

      const text = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'text'
      );
      text.setAttribute('x', `${x}`);
      text.setAttribute('y', '15');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('class', 'tick-text');
      text.textContent = x.toString();
      this.contentGroup.appendChild(text);
    }

    // Деления и подписи по Y
    for (let y = 0; y <= viewHeight; y += step) {
      const tick = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'line'
      );
      tick.setAttribute('x1', '0');
      tick.setAttribute('y1', `${y}`);
      tick.setAttribute('x2', '-5');
      tick.setAttribute('y2', `${y}`);
      tick.setAttribute('stroke', '#333');
      tick.setAttribute('stroke-width', '1');
      this.contentGroup.appendChild(tick);

      const text = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'text'
      );
      text.setAttribute('x', '-10');
      text.setAttribute('y', `${y + 4}`);
      text.setAttribute('text-anchor', 'end');
      text.setAttribute('class', 'tick-text');
      text.textContent = y.toString();
      this.contentGroup.appendChild(text);
    }
  }
}

customElements.define('work-zone', WorkZone);
