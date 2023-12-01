const backstop = require("backstopjs");
const { Builder, By } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

const backstopConfig = {
  id: "backstop_default",
  viewports: [
    {
      label: "phone",
      width: 320,
      height: 480,
    },
    {
      label: "tablet",
      width: 1024,
      height: 768,
    },
    {
      label: "Desktop",
      width: 1024,
      height: 768,
    },
  ],
  onBeforeScript: "puppet/onBefore.js",
  onReadyScript: "puppet/onReady.js",
  scenarios: [
    {
      label: "Visual Regression Test Demo",
      cookiePath: "backstop_data/engine_scripts/cookies.json",
      url: "/dist/index.html",
      referenceUrl: "/dist/index.html",
      readyEvent: "",
      readySelector: "",
      delay: 0,
      hideSelectors: [],
      removeSelectors: [],
      hoverSelector: "",
      clickSelector: "",
      postInteractionWait: 0,
      selectors: ["html"],
      selectorExpansion: true,
      expect: 0,
      misMatchThreshold: 0.1,
      requireSameDimensions: true,
    },
  ],
  paths: {
    bitmaps_reference: "backstop_data/bitmaps_reference",
    bitmaps_test: "backstop_data/bitmaps_test",
    engine_scripts: "backstop_data/engine_scripts",
    html_report: "backstop_data/html_report",
    ci_report: "backstop_data/ci_report",
  },
  report: ["browser"],
  engine: "selenium",
  engineOptions: {
    waitForSelector: "body",
    timeout: 60000,
  },
  asyncCaptureLimit: 5,
  asyncCompareLimit: 50,
  debug: false,
  debugWindow: false,
  seleniumAddress: "http://localhost:4444/wd/hub",
};

async function runSelenium(scenario) {
  const driver = new Builder()
    .forBrowser("chrome")
    .setChromeOptions(new chrome.Options().headless())
    .build();

  try {
    await driver.get(scenario.url);

    await driver.findElement(
      By.css(backstopConfig.engineOptions.waitForSelector)
    );

    const screenshot = await driver.takeScreenshot();

    const path = `backstop_data/bitmaps_reference/${scenario.label}/screenshot.png`;
    require("fs").writeFileSync(path, screenshot, "base64");
  } finally {
    await driver.quit();
  }
}

async function runBackstop() {
  const scenarios = backstopConfig.scenarios;

  for (const scenario of scenarios) {
    await runSelenium(scenario);
  }

  await backstop("test", { config: backstopConfig });
}

runBackstop();
