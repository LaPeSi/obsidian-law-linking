import { request } from "https";
import { App, Modal, Notice } from "obsidian";

export class LawPreview extends Modal {
  paragraph: string;
  book: string;
  constructor(app: App, paragraph: string, book: string) {
    super(app);
    this.paragraph = paragraph;
    this.book = book;
  }

  async onOpen() {
    let { contentEl } = this;
    contentEl.setText("Loading your law preview...");

    let url = `https://www.gesetze-im-internet.de/${this.book}/__${this.paragraph}.html`;

    console.log(url);

    let data = "";
    
    const req = request(url, (res) => {
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        // parse data as html
        let parser = new DOMParser();
        let htmlDoc = parser.parseFromString(data, "text/html");
        // get content
        let content = htmlDoc.getElementsByClassName("jurAbsatz")[0];
        contentEl.empty();
        contentEl.appendChild(new DOMParser().parseFromString("<h1>§" + this.book.toUpperCase() + " " + this.paragraph +"</h1>", "text/html").body);
        contentEl.appendChild(content);
      });
    });
    
    req.on('error', (e) => {
      contentEl.setText(`problem with request: ${e.message}`);
    });
    
    // Write data to request body
    req.end();

  }

  onClose() {
    let { contentEl } = this;
    contentEl.empty();
  }
}