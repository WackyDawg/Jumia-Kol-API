require("dotenv").config();
const express = require('express');
const puppeteer = require('puppeteer');
const geoip = require('geoip-lite');

const app = express();
const port = 3000;
const api_version = 1.0;
let userPageCounts = {};

app.get('/h5/jumia.products.retrieveAndRecommend', async (req, res) => {
  try {
    const { category, userid } = req.query;

    if (!category || !userid) {
      return res.status(400).json({
        "error_response": {
          "msg": "Remote service error",
          "code": 50,
          "sub_msg": "非法参数",
          "sub_code": "isv.invalid-parameter"
        }
      });
    }

    const userKey = req.ip;
    const userIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const geo = geoip.lookup(userIP);

    if (!userPageCounts[userKey] || category !== userPageCounts[userKey].category) {
      userPageCounts[userKey] = { category, page: 1 };
    } else {
      userPageCounts[userKey].page += 1;
    }

    const browser = await puppeteer.launch({
      args: [
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--single-process",
        "--no-zygote",
      ],
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : puppeteer.executablePath(),
    });
    const page = await browser.newPage();

    const url = `https://www.jumia.com.ng/${category}/?page=${userPageCounts[userKey].page}`;

    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('article.prd');

    const productDetails = await page.evaluate((userid) => {
      const productNodes = document.querySelectorAll('article.prd._fb.col.c-prd');
      const products = [];

      productNodes.forEach((productNode) => {
        const anchor = productNode.querySelector('a.core');
        const image = anchor.querySelector('img.img').getAttribute('data-src');
        const productUrl = anchor.getAttribute('href');
        const dataSku = anchor.getAttribute('data-id') || null;
        const dataCategory = anchor.getAttribute('data-category') || '';
        const dataBrand = anchor.getAttribute('data-brand') || '';
        const dataName = anchor.getAttribute('data-name') || '';
        const reviewsElement = productNode.querySelector('div.rev');
        const bdgElement = productNode.querySelector('div.bdg._mall._xs');
        const storeType = bdgElement ? bdgElement.innerText.trim() : '';
        const nameElement = productNode.querySelector('h3.name');
        const productName = nameElement ? nameElement.textContent.trim() : '';

        const product = {
          productUrl,
          image,
          dataSku,
          dataName,
          dataCategory,
          reviews: reviewsElement ? reviewsElement.textContent.trim() : '',
          dataBrand,
          storeType,
          productName,
          promotion_link: `https://kol.jumia.com/api/click/custom/${userid}/306ad549-764c-349e-a497-cdd2d98c349a?r=https://www.jumia.com.ng${productUrl}`,
        };

        products.push(product);
      });

      return products;
    }, userid);

    const totalProducts = productDetails.length;
    const pageNumber = userPageCounts[userKey].page;

    const response = {
      totalProducts,
      pageNumber,
      userIP,
      countryCode: geo,
      language: 'en',
      platform: 'desktop',
      url: `/${category}/`,
      pageType: 'catalog',
      pageSubtype: 'category',
      pageKey: 'catalog_category',
      products: productDetails,
    };

    res.json(response);

    await browser.close();
  } catch (error) {
    console.error('Error during scraping:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
