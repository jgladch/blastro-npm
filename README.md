# Blastro #

> A webapp for generating planetary ephemeris data for a given date and location. Uses Angular.js, Express, and Node.js. Developed by Jeff Gladchun using libraries written by Ole Nielsen and Peter Hayes.

## Summary ##
  > Blastro will generate planetary ephemeris data for any given date and location. This data can be used for astronomical and astrological pursuits.

## Problem ##
  > Currently, there are only a few ways to obtain ephemeris data online. The products that are available are generally implemented using out-dated technologies and feature poor user experience. Blastro aims to streamline the process of obtaining this data and make it an enjoyable experience for the user.

## Solution ##
  > Blastro provides a single-page application and API endpoint to obtain planetary ephemeris data for a given date and location.

## npm-blastro ##
  > Blastro uses an NPM module to generate ephemeris data. This module repurposes code originally written by Peter Hayes (1999) and Ole Nielsen (2002). If you would like to use the same module, you can install it by running: <pre><code>npm install blastro</code></pre> The repository for npm-blastro can be found <a href="http://www.github.com/jgladch/npm-blastro">here</a>.

## Quote from You ##
  > Blastro will make it much easier for users to find accurate ephemeris data online. Galileo, Kepler, Sagan, and Einstein would be proud.

## How to Get Started ##
  > Use our single page Angular.js application by visitng blastro.azurewebsites.net or hit our API Endpoint at blastro.azurewebsites.net/ with a correctly formatted JSON request. The request should meet the following requirements:

  ><pre><code>var requestData = {
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
  > If you are intersted in contributing to this project, please feel free to fork the repo and submit pull requests. I will be responsive.
