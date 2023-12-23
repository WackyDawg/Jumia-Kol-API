const puppeteerExtra = require('puppeteer-extra');
const Stealth = require('puppeteer-extra-plugin-stealth');


puppeteerExtra.use(Stealth());

const authenticate = async () => {
  const browserObj = await puppeteerExtra.launch({
    headless: false, // Change to 'true' for production
    args: [
        '--no-sandbox',
        '--disable-gpu',
        '--disable-setuid-sandbox',
    ],
});

    const newpage = await browserObj.newPage();
    const ads_page = 'https://www.jumia.com.ng/xiaomi-redmi-a2-6.52-2gb-ram32gb-rom-android-12-black-257262601.html'
    const s2 = 'marketplace'
    const email = '';
    const password = '';

    await newpage.goto('https://kol.jumia.com/login');

    await newpage.type('#email', email);

    await newpage.type('input[name="password"]', password);

    await newpage.click('.btn-primary');

    await newpage.waitForNavigation();

    await newpage.goto('https://kol.jumia.com/creatives/link/306ad549-764c-349e-a497-cdd2d98c349a')

    await newpage.type('input[name="page"]', ads_page)

    await newpage.type('input[name="s2"]', s2)

    await newpage.waitForSelector('#advertising_customlink_url');

    await newpage.click('#advertising_customlink_url');

    await newpage.screenshot({ path: 'output/screenshot.png' });

    //await browser.close();
};

authenticate();
