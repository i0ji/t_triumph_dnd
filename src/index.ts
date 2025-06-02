import '@components/app-header';
import '@components/common-button';
import '@components/buffer-zone';
import { BufferZone } from './components/buffer-zone';
import './index.scss';

document.addEventListener('common-button-create', () => {
  const bufferZone = document.querySelector('buffer-zone') as BufferZone | null;
  bufferZone?.createRandomPolygon();
});