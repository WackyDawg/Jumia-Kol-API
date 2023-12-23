const express = require('express');
const puppeteer = require('puppeteer');
const geoip = require('geoip-lite');


const app = express();
const port = 3000; // Set your desired port number

app.get('/scrape', async (req, res) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const url = 'https://www.jumia.com.ng/groceries/'; // Replace with the actual URL

    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Extract data from all products on the page
    const productDetails = await page.evaluate(() => {
      const productNodes = document.querySelectorAll('article.prd._fb.col.c-prd');

      const products = [];

      productNodes.forEach((productNode) => {
        const anchor = productNode.querySelector('a.core');
        const imageUrl = product.querySelector('.img').getAttribute('data-src');
        const sku = anchor.getAttribute('data-sku');
        const category = anchor.getAttribute('data-category');
        const brand = anchor.getAttribute('data-brand');
        const reviewsElement = productNode.querySelector('div.rev');
        const expressShippingElement = productNode.querySelector('svg.ic.xprss');

        const product = {
          url: anchor.href,
          image: image,
          sku: sku || '',
          category: category || '',
          brand: brand || '',
          reviews: reviewsElement ? reviewsElement.textContent.trim() : '',
          expressShipping: expressShippingElement ? true : false,
        };

        products.push(product);
      });

      return products;
    });

    res.json(productDetails);

    await browser.close();
  } catch (error) {
    console.error('Error during scraping:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
