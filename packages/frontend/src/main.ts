import { getApplicationTitle } from './title';

const titleElement = document.querySelector<HTMLHeadingElement>('#app-title');

if (titleElement === null) {
  throw new Error('Missing #app-title element in document.');
}

titleElement.textContent = getApplicationTitle();
