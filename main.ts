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
				const regex = /(^| )(§ [0-9]+ [a-zA-Z]+)/gm;
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
				// if target mathes accepted § format show modal
				if (target.innerText.match(/§ [0-9]+ [a-zA-Z]+/gm) && target.innerText.split('§')[1].split(' ')[2] != "Abs.") {
					let book = target.innerText.split('§')[1].split(' ')[2];
					book = book.toLowerCase();
					let paragraph = target.innerText.split('§')[1].split(' ')[1];
					// show modal
					if (book && paragraph)
						new LawPreview(this.app, paragraph, book).open();
				}
				else {
					// scan for other § matches in children from same parent (for example if in preview and you click on nested §)
					const children = target.parentElement?.children;
					if (children) {
						for (let i = 0; i < children.length; i++) {
							const child = children[i];
							if (child.innerHTML.match(/§[a-zA-Z]+ [0-9]+/gm)) {
								// show modal
								const book = child.innerHTML.match(/§[a-zA-Z]+ [0-9]+/gm)?.[0].split('§')[1].split(' ')[0].toLowerCase();
								const paragraph = target.innerText.split('§')[1].split(/[\s,]+/)[1];
								if (book && paragraph)
									new LawPreview(this.app, paragraph, book).open();
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
									const book = child.innerHTML.match(/§[a-zA-Z]+ [0-9]+/gm)?.[0].split('§')[1].split(' ')[0].toLowerCase();
									const paragraph = target.innerText.split('§')[1].split(/[\s,]+/)[1];
									if (book && paragraph)
										new LawPreview(this.app, paragraph, book).open();
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
