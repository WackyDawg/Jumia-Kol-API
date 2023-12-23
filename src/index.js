const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = 3000;
let pageCounter = 1;


async function scrapeProducts(categoryUrl, pageNumber, category) {
    const browser = await puppeteer.launch({
        headless: false, // Change to 'true' for production
        args: [
            '--no-sandbox',
            '--disable-gpu',
            '--disable-setuid-sandbox',
        ],
    });    const page = await browser.newPage();

    const urlWithPage = `${categoryUrl}/?page=${pageNumber}`;
    console.log(`Scraping URL: ${urlWithPage}`);
    await page.goto(urlWithPage);


    const products = await page.evaluate(() => {

        const productCards = document.querySelectorAll('article.prd');
        const productsData = [];

        for (const card of productCards) {
            const imgElement = card.querySelector('.img-c img');
            const infoDiv = card.querySelector('.info');

            if (!imgElement || !infoDiv) {
                continue;
            }
            const svgElement = infoDiv.querySelector('svg.ic.xprss');
            const ariaLabel = svgElement ? svgElement.getAttribute('aria-label') : '';
            const nameElement = infoDiv.querySelector('h3.name');
            const priceElement = infoDiv.querySelector('.prc');
            const sPrcWElement = infoDiv.querySelector('.s-prc-w');
            const revElement = infoDiv.querySelector('div.rev');

            if (!nameElement || !priceElement || !sPrcWElement || !revElement) {
                continue;
            }

            const strikeThroughPriceElement = sPrcWElement.querySelector('.old');
            const strikeThroughPrice = strikeThroughPriceElement ? strikeThroughPriceElement.textContent.trim() : '';
            const cleanStrikeThroughPrice = strikeThroughPrice.replace(/%/, '');

            const discountElement = sPrcWElement.querySelector('.bdg._dsct._sm');
            const discountPercentage = discountElement ? discountElement.textContent.trim() : '';

            const imageUrl = imgElement.getAttribute('data-src') || imgElement.getAttribute('src');


            const product = {
                app_sale_price: '',
                app_sale_price_currency: 'NGN',
                commission_rate: '0%',
                discount: discountPercentage,
                reviews: revElement.textContent.trim(),
                evaluate_rate: '3.67',
                first_level_category_id: 0,
                first_level_category_name: '',
                lastest_volume: 0,
                hot_product_commission_rate: '60%',
                original_price: priceElement.textContent.trim(),
                original_price_currency: 'NGN',
                platform_product_type: ariaLabel,
                product_detail_url: 'https://www.aliexpress.com/item/33006951782.html',
                product_id: 33006951782,
                product_main_image_url: imageUrl,
                product_small_image_urls: {
                    string: [
                        ''
                    ]
                },
                product_title: nameElement.textContent.trim(),
                product_video_url: '',
                promotion_link: 'http://s.click.aliexpress.com/e/xxxxx',
                sale_price: priceElement.textContent.trim(),
                sale_price_currency: 'NGN',
                second_level_category_id: 0,
                second_level_category_name: ``,
                shop_id: 0,
                shop_url: 'https://www.aliexpress.com/store/3255036',
                target_app_sale_price: priceElement.textContent.trim(),
                target_app_sale_price_currency: 'NGN',
                target_original_price: sPrcWElement.textContent.trim(),
                target_original_price_currency: 'NGN',
                target_sale_price: priceElement.textContent.trim(),
                target_sale_price_currency: 'NGN',
                relevant_market_commission_rate: '10%',
                promo_code_info: {
                    promo_code: '',
                    code_campaigntype: '',
                    code_value: '',
                    code_availabletime_start: '',
                    code_availabletime_end: '',
                    code_mini_spend: '1',
                    code_quantity: '1',
                    code_promotionurl: ''
                }
            };

            productsData.push(product);

        }
        return productsData;
    });

    return { products };
}


app.get('/jumia/products', async (req, res) => {
    try {
        const category = req.query.cat;
        if (!category) {
            throw new Error({
                "error_response": {
                    "msg": "Remote service error",
                    "code": 50,
                    "sub_msg": "非法参数",
                    "sub_code": "isv.invalid-parameter"
                }
            });
        }

        const { products, totalScrapedProducts } = await scrapeProducts(`https://www.jumia.com.ng/${category}`, pageCounter);
        if (category === "health-beauty") {
            for (const product of products) {
                product.commission_rate = "2.0%",
                product.hot_product_commission_rate = "",
                product.relevant_market_commission_rate = "";
            }
        }
        const response = {
            jumia_affiliate_product_query_response: {
                resp_result: {
                    resp_code: 200,
                    resp_msg: "success",
                    result: {
                        current_page_no: pageCounter,
                        current_record_count: products.length,
                        total_products_scraped: totalScrapedProducts,
                        products: {
                            product: products,
                        },
                        total_page_no: 222,
                        total_record_count: 3333,
                    },
                },
            },
        };

        res.json(response);

        pageCounter++;
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
