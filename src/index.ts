import "@components/app-header";
import "@components/common-button";
import "@components/buffer-zone";
import "@components/work-zone";
import { BufferZone } from "./components/buffer-zone";
import { WorkZone } from "./components/work-zone";
import "./index.scss";

document.addEventListener("common-button-create", () => {
  const bufferZone = document.querySelector("buffer-zone") as BufferZone | null;
  bufferZone?.createRandomPolygon();
});

document.addEventListener("common-button-clear", () => {
  const bufferZone = document.querySelector("buffer-zone") as BufferZone | null;
  // const workZone = document.querySelector("work-zone") as WorkZone | null;
  bufferZone?.clear();
});

document.addEventListener("common-button-save", () => {
  const bufferZone = document.querySelector("buffer-zone") as BufferZone | null;
  // const workZone = document.querySelector("work-zone") as WorkZone | null;
  bufferZone?.save();
});
