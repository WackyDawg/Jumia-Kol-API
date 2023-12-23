const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = 3000;

let pageCounter = {}; 

app.get('/jumia/products', async (req, res) => {
  const { cat } = req.query;

  if (!cat) {
    return res.status(400).send({
      "error_response": {
        "msg": "Remote service error",
        "code": 50,
        "sub_msg": "非法参数",
        "sub_code": "Missing category (cat) parameter"
      }
    });
  }

  if (!pageCounter[cat]) {
    pageCounter[cat] = 1;
  } else {
    pageCounter[cat]++;
  }

  const url = `https://www.jumia.com.ng/${cat}/?page=${pageCounter[cat]}`;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(url);

  const productInfoList = await extractProductInfo(page);

  await browser.close();

  res.json({ category: cat, page: pageCounter[cat], productCount: productInfoList.length, productInfoList });
});

async function extractProductInfo(page) {
  await page.waitForTimeout(3000);

  const productInfoList = await page.evaluate((category) => {
    const products = document.querySelectorAll('article.prd');
    const productInfoArray = [];
    let productCount = 0;

    products.forEach((product) => {
        const name = product.querySelector('.name').innerText;
        const price = product.querySelector('.prc').innerText;
        const productUrl = product.querySelector('.core').getAttribute('href');
        const imageUrl = product.querySelector('.img').getAttribute('data-src');
  
        const idMatch = productUrl.match(/\d{9}/);
        const id = idMatch ? idMatch[0] : '';
        const rawPrice = parseFloat(price.replace(/[^\d.]/g, ''));
        const brand = name.split(' ')[0];
  
        productInfoArray.push({
          id: id,
          name: name,
          displayName: name,
          brand: brand,
          sellerId: '',
          isShopExpress: false,
          categories: category,
          prices: {
            rawPrice: rawPrice.toFixed(2),
            price: price,
            priceEuro: '',
            taxEuro: '',
            oldPrice: '',
            oldPriceEuro: '',
            discount: '',
          },
          tags: '',
          rating: {
            average: 0,
            totalRatings: 0,
          },
          image: imageUrl,
          url: productUrl,
          badges: {
            campaign: {
              name: '',
              identifier: '',
              image: '',
              url: '',
            },
          },
          isBuyable: false,
          shopExpress: {
            title: '',
          },
          selectedVariation: '',
        });
        
        productCount++;
      });

    return { productCount, productInfoArray };
  });

  return productInfoList.productInfoArray;
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
