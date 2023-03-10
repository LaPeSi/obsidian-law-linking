import { request } from "http";
import { App, Modal } from "obsidian";

export class LawPreview extends Modal {
  context: string;
  constructor(app: App, context: string) {
    super(app);
    this.context = context;
  }

  async onOpen() {
    let { contentEl } = this;
    contentEl.setText("Loading your law preview...");

    let book = this.context.split("§")[1].split(" ")[0];
    book = book.toLowerCase();
    let paragraph = this.context.split("§")[1].split(/[\s,]+/)[1];

    let url = `http://www.gesetze-im-internet.de/${book}/__${paragraph}.html`;

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
        contentEl.appendChild(new DOMParser().parseFromString("<h1>§" + book.toUpperCase() + " " + paragraph +"</h1>", "text/html").body);
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