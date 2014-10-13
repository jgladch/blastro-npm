# Blastro #

> A RESTful API for generating ephemeris data powered by Express and Node.js

<!-- 

There is an approach called "working backwards" that is widely used at Amazon. They work backwards from the customer, rather than starting with an idea for a product and trying to bolt customers onto it. While working backwards can be applied to any specific product decision, using this approach is especially important when developing new products or features.

For new initiatives a product manager typically starts by writing an internal press release announcing the finished product. The target audience for the press release is the new/updated product's customers, which can be retail customers or internal users of a tool or technology. Internal press releases are centered around the customer problem, how current solutions (internal or external) fail, and how the new product will blow away existing solutions.

Keep it simple. 3-4 sentences for each heading. Cut out the fat. Don't make it into a spec.

Oh, and I also like to write press-releases in what I call "Oprah-speak" for mainstream consumer products. Imagine you're sitting on Oprah's couch and have just explained the product to her, and then you listen as she explains it to her audience. That's "Oprah-speak", not "Geek-speak".

 -->
## Summary ##
  > Blastro will generate ephemeris data for celestial bodies for any given date and location. This data can be used for astronomical and astrological pursuits.

## Problem ##
  > Currently, there are only a few ways to obtain ephemeris data online. The products that are available are generally implemented using out-dated technologies and feature poor user experience. Blastro aims to streamline the process of obtaining this data and make it an enjoyable experience for the user.

## Solution ##
  > Blastro provides an API endpoint to obtain planetary ephemeris data for a given date and location.

## Quote from You ##
  > Blastro is going to revolutionize the amateur astronomy and astrology markets. Johannes Kepler will be spinning in his grave.

## How to Get Started ##
  > Hit our API Endpoint at blastro.azurewebsites.com/data with a correctly formatted JSON request. The request should meet the following requirements:

  ><pre><code>
  var requestData = {
    second: 0,
    minute: 47,
    hour: 6,
    day: 14,
    month: 11,
    year: 1987,
    timezone: -5,
    longitude: -84.2,
    latitude: 42.4,   
    altitude: 100,
    isVedic: true
  }
</code></pre>

## Customer Quote ##
  > "Thank god for Blastro. Now I can get my ephemeris data without having to use crappy, outdated, ugly astronomy websites. I don't know what I would do without it."

## Closing and Call to Action ##
  > Wrap it up and give pointers where the reader should go next.
