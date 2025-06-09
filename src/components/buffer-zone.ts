// const template = document.createElement('template');
// template.innerHTML = `
//   <style>
//     section {
//       height: 40vh;
//       width: 100%;

//       margin-top: 1rem;

//       background-color: #323232;
//     }
//     svg {
//       width: 100%;
//       height: 100%;
//       border: 1px solid #ccc;
//       user-select: none;
//     }
//     polygon {
//       fill: rgba(142, 0, 38, 0.6);
//       stroke: #8e0026;
//       stroke-width: 2;
//       cursor: pointer;
//       transition: fill 0.3s;
//     }
//     polygon:hover {
//       fill: #8e0026;
//     }
//   </style>
//   <section> 
//     <svg></svg>
//   </section>
// `;

// export class BufferZone extends HTMLElement {
//   private svg!: SVGSVGElement;

//   constructor() {
//     super();
//     this.attachShadow({ mode: 'open' });
//     this.shadowRoot!.appendChild(
//       template.content.cloneNode(true)
//     );
//     this.svg = this.shadowRoot!.querySelector('svg')!;
//   }

//   connectedCallback() {
//     this.loadFromStorage();
//   }

//   public createRandomPolygon() {
//     const svgWidth = this.svg.clientWidth || 400;
//     const svgHeight = this.svg.clientHeight || 400;

//     const margin = 50;
//     // const centerX = this.randomFloat(margin, svgWidth - margin);
//     // const centerY = this.randomFloat(margin, svgHeight - margin);
//      for (let attempt = 0; attempt < 50; attempt++) {
//       const centerX = this.randomFloat(margin, svgWidth - margin);
//       const centerY = this.randomFloat(margin, svgHeight - margin);
//       const maxRadius = 60;

//       if (this.isColliding(centerX, centerY, maxRadius)) continue;

//       const polygon = this.generatePolygon(centerX, centerY, maxRadius);
//       this.svg.appendChild(polygon);
//       return;
//     }
//   }

//     const vertexCount = this.randomInt(3, 8);
//     const angleStep = (2 * Math.PI) / vertexCount;
//     const angles: number[] = [];

//     for (let i = 0; i < vertexCount; i++) {
//       const randomOffset =
//         (Math.random() - 0.5) * angleStep * 0.3;
//       angles.push(i * angleStep + randomOffset);
//     }

//     const minRadius = 20;
//     const maxRadius = 50;

//     const points: string[] = angles.map((angle) => {
//       const radius = this.randomFloat(minRadius, maxRadius);
//       const x = centerX + radius * Math.cos(angle);
//       const y = centerY + radius * Math.sin(angle);
//       return `${x.toFixed(2)},${y.toFixed(2)}`;
//     });

//     const polygon = document.createElementNS(
//       'http://www.w3.org/2000/svg',
//       'polygon'
//     );
//     polygon.setAttribute('points', points.join(' '));
//     polygon.setAttribute('fill', 'rgba(142, 0, 38, 0.6)');
//     polygon.setAttribute('stroke', '#8e0026');
//     polygon.setAttribute('stroke-width', '2');
//     polygon.setAttribute('draggable', 'true');

//     polygon.addEventListener('dragstart', (e) => {
//       if (e.dataTransfer) {
//         e.dataTransfer.setData('text/plain', points.join(' '));
//         e.dataTransfer.effectAllowed = 'move';
//         polygon.style.opacity = '0.5';
//       }
//     });

//     polygon.addEventListener('dragend', () => {
//       polygon.style.opacity = '1';
//     });

//     this.svg.appendChild(polygon);
//   }

//   private generatePolygon(
//     centerX: number,
//     centerY: number,
//     maxRadius: number
//   ): SVGPolygonElement {
//     const vertexCount = this.randomInt(3, 8); // произвольное число вершин
//     const angleStep = (2 * Math.PI) / vertexCount;

//     const points = Array.from(
//       { length: vertexCount },
//       (_, i) => {
//         const angle =
//           i * angleStep +
//           (Math.random() - 0.5) * angleStep * 0.5;
//         const radius = this.randomFloat(20, maxRadius);
//         const x = centerX + radius * Math.cos(angle);
//         const y = centerY + radius * Math.sin(angle);
//         return `${x.toFixed(2)},${y.toFixed(2)}`;
//       }
//     ).join(' ');

//     const polygon = document.createElementNS(
//       'http://www.w3.org/2000/svg',
//       'polygon'
//     );
//     polygon.setAttribute('points', points);
//     polygon.setAttribute('fill', 'rgba(142, 0, 38, 0.6)');
//     polygon.setAttribute('stroke', '#8e0026');
//     polygon.setAttribute('stroke-width', '2');
//     polygon.setAttribute('draggable', 'true');

//     // Добавь обработчики событий, если нужно
//     polygon.addEventListener('dragstart', (e) => {
//       if (e.dataTransfer) {
//         e.dataTransfer.setData('text/plain', points);
//         e.dataTransfer.effectAllowed = 'move';
//         polygon.style.opacity = '0.5';
//       }
//     });

//     polygon.addEventListener('dragend', () => {
//       polygon.style.opacity = '1';
//     });

//     return polygon;
//   }

//   private isColliding(
//     newCenterX: number,
//     newCenterY: number,
//     radius: number
//   ): boolean {
//     return Array.from(this.svg.querySelectorAll('polygon')).some(
//       (existing) => {
//         const existingPoints = existing
//           .getAttribute('points')!
//           .split(' ');
//         const existingCenter = {
//           x:
//             existingPoints.reduce(
//               (sum, p) => sum + parseFloat(p.split(',')[0]),
//               0
//             ) / existingPoints.length,
//           y:
//             existingPoints.reduce(
//               (sum, p) => sum + parseFloat(p.split(',')[1]),
//               0
//             ) / existingPoints.length,
//         };

//         const distance = Math.hypot(
//           newCenterX - existingCenter.x,
//           newCenterY - existingCenter.y
//         );

//         return distance < radius + 50; // 50 - минимальный отступ
//       }
//     );
//   }

//   private randomInt(min: number, max: number): number {
//     return Math.floor(Math.random() * (max - min + 1)) + min;
//   }

//   private randomFloat(min: number, max: number): number {
//     return Math.random() * (max - min) + min;
//   }

//   public clear() {
//     while (this.svg.firstChild) {
//       this.svg.removeChild(this.svg.firstChild);
//     }
//     localStorage.removeItem('bufferZonePolygons');
//   }

//   public save() {
//     const polygons = Array.from(
//       this.svg.querySelectorAll('polygon')
//     ).map((polygon) => ({
//       points: polygon.getAttribute('points'),
//       fill: polygon.getAttribute('fill'),
//       stroke: polygon.getAttribute('stroke'),
//       strokeWidth: polygon.getAttribute('stroke-width'),
//     }));

//     localStorage.setItem(
//       'bufferZonePolygons',
//       JSON.stringify(polygons)
//     );
//     console.log(
//       'BufferZone: сохранено',
//       polygons.length,
//       'полигонов'
//     );
//   }

//   private loadFromStorage() {
//     const data = localStorage.getItem('bufferZonePolygons');
//     if (!data) return;

//     try {
//       const polygons = JSON.parse(data) as Array<{
//         points: string | null;
//         fill: string | null;
//         stroke: string | null;
//         strokeWidth: string | null;
//       }>;

//       polygons.forEach(
//         ({ points, fill, stroke, strokeWidth }) => {
//           if (!points) return;
//           const polygon = document.createElementNS(
//             'http://www.w3.org/2000/svg',
//             'polygon'
//           );
//           polygon.setAttribute('points', points);
//           if (fill) polygon.setAttribute('fill', fill);
//           if (stroke) polygon.setAttribute('stroke', stroke);
//           if (strokeWidth)
//             polygon.setAttribute('stroke-width', strokeWidth);

//           polygon.addEventListener('click', () =>
//             polygon.remove()
//           );

//           this.svg.appendChild(polygon);
//         }
//       );
//     } catch (e) {
//       console.error(
//         'Ошибка при загрузке полигона из localStorage',
//         e
//       );
//     }
//   }
// }

// customElements.define('buffer-zone', BufferZone);
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
  private readonly POLYGON_MARGIN = 50; // мин. расстояние между центрами
  private readonly MAX_RADIUS = 60;     // макс. радиус полигона
  private readonly MAX_ATTEMPTS = 100;  // макс. попыток разместить полигон

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
    this.svg = this.shadowRoot!.querySelector('svg')!;
  }

  connectedCallback() {
    this.loadFromStorage();
  }

  // Создаёт от 5 до 20 непересекающихся полигонов
  public createMultiplePolygons() {
    const count = this.randomInt(5, 20);
    for (let i = 0; i < count; i++) {
      this.createRandomPolygon();
    }
  }

  // Создаёт один полигон с проверкой пересечений
  public createRandomPolygon() {
    const svgWidth = this.svg.clientWidth || 400;
    const svgHeight = this.svg.clientHeight || 400;
    const margin = this.POLYGON_MARGIN + this.MAX_RADIUS;

    for (let attempt = 0; attempt < this.MAX_ATTEMPTS; attempt++) {
      const centerX = this.randomFloat(margin, svgWidth - margin);
      const centerY = this.randomFloat(margin, svgHeight - margin);

      if (this.isColliding(centerX, centerY, this.MAX_RADIUS)) {
        continue;
      }

      const polygon = this.generatePolygon(centerX, centerY, this.MAX_RADIUS);
      this.svg.appendChild(polygon);
      return;
    }
    console.warn('BufferZone: не удалось разместить новый полигон без пересечений');
  }

  private generatePolygon(centerX: number, centerY: number, maxRadius: number): SVGPolygonElement {
    const vertexCount = this.randomInt(3, 8);
    const angleStep = (2 * Math.PI) / vertexCount;

    const points = Array.from({ length: vertexCount }, (_, i) => {
      const angle = i * angleStep + (Math.random() - 0.5) * angleStep * 0.5;
      const radius = this.randomFloat(20, maxRadius);
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(' ');

    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', points);
    polygon.setAttribute('fill', 'rgba(142, 0, 38, 0.6)');
    polygon.setAttribute('stroke', '#8e0026');
    polygon.setAttribute('stroke-width', '2');
    polygon.setAttribute('draggable', 'true');

    polygon.addEventListener('dragstart', (e) => {
      if (e.dataTransfer) {
        e.dataTransfer.setData('text/plain', points);
        e.dataTransfer.effectAllowed = 'move';
        polygon.style.opacity = '0.5';
      }
    });

    polygon.addEventListener('dragend', () => {
      polygon.style.opacity = '1';
    });

    polygon.addEventListener('click', () => polygon.remove());

    return polygon;
  }

  private isColliding(newCenterX: number, newCenterY: number, radius: number): boolean {
    const polygons = Array.from(this.svg.querySelectorAll('polygon'));
    for (const polygon of polygons) {
      const pointsAttr = polygon.getAttribute('points');
      if (!pointsAttr) continue;

      const points = pointsAttr.split(' ').map(p => {
        const [x, y] = p.split(',').map(Number);
        return { x, y };
      });

      const center = points.reduce(
        (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
        { x: 0, y: 0 }
      );
      center.x /= points.length;
      center.y /= points.length;

      const dist = Math.hypot(newCenterX - center.x, newCenterY - center.y);
      if (dist < radius + this.POLYGON_MARGIN) {
        return true;
      }
    }
    return false;
  }

  public clear() {
    while (this.svg.firstChild) {
      this.svg.removeChild(this.svg.firstChild);
    }
    localStorage.removeItem('bufferZonePolygons');
  }

  public save() {
    const polygons = Array.from(this.svg.querySelectorAll('polygon')).map((polygon) => ({
      points: polygon.getAttribute('points'),
      fill: polygon.getAttribute('fill'),
      stroke: polygon.getAttribute('stroke'),
      strokeWidth: polygon.getAttribute('stroke-width'),
    }));

    localStorage.setItem('bufferZonePolygons', JSON.stringify(polygons));
    console.log('BufferZone: сохранено', polygons.length, 'полигонов');
  }

  private loadFromStorage() {
    const data = localStorage.getItem('bufferZonePolygons');
    if (!data) return;

    try {
      const polygons = JSON.parse(data) as Array<{
        points: string | null;
        fill: string | null;
        stroke: string | null;
        strokeWidth: string | null;
      }>;

      polygons.forEach(({ points, fill, stroke, strokeWidth }) => {
        if (!points) return;
        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', points);
        if (fill) polygon.setAttribute('fill', fill);
        if (stroke) polygon.setAttribute('stroke', stroke);
        if (strokeWidth) polygon.setAttribute('stroke-width', strokeWidth);

        polygon.addEventListener('click', () => polygon.remove());

        this.svg.appendChild(polygon);
      });
    } catch (e) {
      console.error('Ошибка при загрузке полигона из localStorage', e);
    }
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private randomFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }
}

customElements.define('buffer-zone', BufferZone);
