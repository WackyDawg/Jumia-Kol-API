# Jumia KOL Affiliates API (Beta)

## Overview

The Jumia KOL (Key Opinion Leader) Affiliates API is a powerful tool designed exclusively for Jumia KOL affiliates. It enables seamless retrieval of Jumia product details and the automatic generation of affiliate promotion links using the affiliate's KOL account ID.

**Note: This API is currently in the beta stage.**

## Features

- **Product Retrieval:** Easily fetch product details from the Jumia e-commerce platform.
- **Affiliate Promotion Link:** Auto-generate affiliate promotion links using your KOL account ID.
- **Personalization:** Specify a product category and KOL account ID for personalized recommendations.

## Usage

### Endpoint

`GET /h5/jumia.products.retrieveAndRecommend`

### Parameters

- **category:** Specify the desired product category.
- **userid:** Unique user identifier for personalized recommendations.

### Response

The API returns a JSON response with essential information about the requested products, including images, URLs, and an automatically generated affiliate promotion link.

### Example Request

```bash
curl -X GET "https://jumia-affiliate-product-query.onrender.com/h5/jumia.products.retrieveAndRecommend?category=electronics&userid=0ae9decc-76b2-4c02-a770-83bd35f2a5cd"
