// Import Obsidian API
import { Plugin, Workspace, Notice } from 'obsidian';
// Import Modal
import { LawPreview } from './modal';

export default class LawPlugin extends Plugin {
	// Override onload method
	async onload() {
		// Register event on current leaf
		this.registerDomEvent(document, 'dblclick', (evt) => {
			// get clicked element
			const target = evt.target as HTMLElement;
			// check if Target contains §
			if (target.innerText.includes('§')) {
				// show modal
				new LawPreview(this.app, target.innerText).open();
			}
		});
	}
}