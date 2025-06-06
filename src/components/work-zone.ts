import * as d3 from "d3";

const template = document.createElement("template");
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

export class WorkZone extends HTMLElement {}

customElements.define("work-zone", WorkZone);
