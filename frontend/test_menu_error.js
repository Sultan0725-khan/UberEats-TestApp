const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on("pageerror", (err) => console.log("PAGE ERROR:", err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") console.log("CONSOLE ERROR:", msg.text());
  });
  await page.goto("http://localhost:5173/menus");
  // Wait for the Get Menu panel's Send Request button and click it
  const buttons = await page.$$("button");
  for (let btn of buttons) {
    const text = await btn.textContent();
    if (text.includes("Send Request")) {
      const panel = await btn.evaluateHandle((el) =>
        el.closest(".bg-surface.border"),
      );
      const heading = await panel.$("h2");
      const headingText = await heading.textContent();
      if (headingText === "Get Menu") {
        await btn.click();
        console.log("Clicked Get Menu");
        break;
      }
    }
  }
  await page.waitForTimeout(3000);
  await browser.close();
})();
