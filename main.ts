// Import Obsidian API
import { Plugin, Workspace, Notice } from 'obsidian';
// Import Modal
import { LawPreview } from './modal';
import * as fs from 'fs';

export default class LawPlugin extends Plugin {
	refreshLawLinks = async() => {
		const file = this.app.workspace.getActiveFile();
		// open file
		if (file) {
			// get file content
			const content = await this.app.vault.read(file);
			// check if file contains §
			if (content) {
				const regex = /(^| )(§[a-zA-Z]+ [0-9]+)/gm;
				// output amount of regex matches
				new Notice('Replaced ' + (content.match(regex)?.length ? content.match(regex)?.length : 0));
				// replace § with link
				const newContent = content.replace(regex, '<a>$2</a>');
				// write new content to file
				await this.app.vault.modify(file, newContent);
			}
		}
		else {
			new Notice('No File Open');
		}
	}

	// Override onload method
	async onload() {
		// Register event on current leaf
		this.registerDomEvent(document, 'dblclick', async (evt) => {
			// get clicked element
			const target = evt.target as HTMLElement;
			// check if Target contains §
			if (target.innerText.includes('§')) {
				// if target mathes § [a-zA-Z]* [0-9]* open modal
				if(target.innerText.match(/§[a-zA-Z]+ [0-9]+/gm)) {
					// show modal
					new LawPreview(this.app, target.innerText).open();
				}
				else {
					// scan for other § matches in children from same parent
					const children = target.parentElement?.children;
					if (children) {
						for (let i = 0; i < children.length; i++) {
							const child = children[i];
							if (child.innerHTML.match(/§[a-zA-Z]+ [0-9]+/gm)) {
								// show modal
								const book = child.innerHTML.match(/§[a-zA-Z]+ [0-9]+/gm)?.[0].split('§')[1].split(' ')[0];
								const paragraph = target.innerText.split('§')[1].split(/[\s,]+/)[1];
								new LawPreview(this.app, '§' + book + ' ' + paragraph).open();
								return;
							}
						}
					}
					// get parent with modal-content class
					let parent = target.parentElement;
					while (parent && !parent.classList.contains('modal-content')) {
						parent = parent.parentElement;
					}
					// scan for other § matches in children from parent
					if (parent) {
						const children = parent.children;
						if (children) {
							for (let i = 0; i < children.length; i++) {
								const child = children[i];
								if (child.innerHTML.match(/§[a-zA-Z]+ [0-9]+/gm)) {
									// show modal
									const book = child.innerHTML.match(/§[a-zA-Z]+ [0-9]+/gm)?.[0].split('§')[1].split(' ')[0];
									const paragraph = target.innerText.split('§')[1].split(/[\s,]+/)[1];
									new LawPreview(this.app, '§' + book + ' ' + paragraph).open();
									return;
								}
							}
						}
					}
				}
			}
		});

		// Add Command
		this.addCommand({
			id: 'refresh-law-links',
			name: 'Refresh Law Links',
			callback: () => {
				this.refreshLawLinks();
			},
		});
	}	
}
