import { attachCrystalFrame } from './crystal-framing.js';
export function initEmbeddedWorkspaces(){
 attachCrystalFrame(document.querySelector('#map-mount'));
 attachCrystalFrame(document.querySelector('#notes-mount'));
}
