import { writable } from 'svelte/store';

export const switchPos = writable({
  x: 0,
  y: 0,
});
