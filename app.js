// This imports and configures the dotenv package which is used to load
// environment variables from a file named '.env'. It allows th application
// to securely store and access sensitive information like API keys and secrets.
require('dotenv').config()

// Importing the express package. A popular Node.js web application framework.
const express = require('express')
// Importing the morgan package. A middleware for logging HTTP requests.
const logger = require('morgan')
// Importing the errorhandler package. A middleware for handling errors in an Express application.
const errorHandler = require('errorhandler')
// Importing the body-parser package. A middleware used to parse incoming request bodies,
// such as JSON and URL-encoded data.
const bodyParser = require('body-parser')
// Importing the method-override package. A middleware that allows HTTP methods like PUT and DELETE
// to be simulated in situations where the client (e.g., a browser) may not support them.
const methodOverride = require('method-override')
// Importing the path module. Provides utilities for working with file and directory paths.
const path = require('path')
const app = express()
const port = 3000

// Hot Module Replacement (HMR). A feature often used in development environments to enable
// the replacement of updated modules without requiring a full page reload.
if (module.hot) {
  module.hot.accept()
}

// Importing the @prismic/client package. The Prismic client library to interact with the Prismic CMS.
const Prismic = require('@prismicio/client')

// A arrow function initializing a Prismic API client by configuring it with the Prismic CMS endpoint,
// an access token, and a fetch function. This client can then be used to make requests to the Prismic CMS
// to retrieve content and data for the application.
const initApi = (req) => {
  // Returning the result from the function Prismic.createClient. A function from Prismic client library.
  return Prismic.createClient(process.env.PRISMIC_ENDPOINT, {
    // Configurating several properties when creating a Prismic client.
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
    // Represent an HTTP request object to be used by the Pismic client.
    req,
    // A standard function in Javascript used for making HTTP requests. It's commonly used for fetching data from APIs.
    // By including this inside the Prismic client configuration, The Prismic client might use this fetch function for
    // its network requests.
    fetch
  })
}

// Link resolver
// A arrow function that takes a doc object as a parameter and is responsible for generating URLs based on the type
// property of the doc object.
const handleLinkResolver = (doc) => {
  // Checks whether the type property of the doc object is equal to the string 'product'. In other words, it's checking
  // if the document represents a product.
  if (doc.type === 'product') {
    // If the document type is a product, it returns a URL string that is constructed using a template literal.
    return `/detail/${doc.slug}`
  }

  if (doc.type === 'about') {
    return '/about'
  }

  if (doc.type === 'collections') {
    return '/collections'
  }

  // This is the default case that executes when none of the previous conditions match. It assumes that if the type
  // of the document doesn't match any of the specified types, it should return a default URL.
  return '/'
}

// Configuring various middleware functions for Express.js web application.
// The middleware functions in Express.js are functions that are executed in the order they are defined.
// Middleware for request logging using the morgan package. The 'dev' argument specifies a predefined logging format
// that logs incoming HTTP requests with details such as HTTP method, status code, response time, and URL.
app.use(logger('dev'))
// Middleware for parsing incoming JSON request bodies. It's using the 'body-parser' package to parse JSON data sent
// in HTTP requests. This middleware makes the parsed JSON data available in the 'req.body' propery of incoming requests.
app.use(bodyParser.json())
// Middleware for parsing URL-encoded requests bodies using the 'body-parser' package. The { extended: false } option
// indicates that the parsing should not allow rich objects or arrays in the URL-encoded data.
app.use(bodyParser.urlencoded({ extended: false }))
// Middleware for method override that allows clients to use HTTP methods like PUT and DELETE even if their browsers or
// clients may not natively support them.
app.use(methodOverride())
// Middleware for error handling, typically used in development environments to provide detailed error messages when an
// error occurs in the application.
app.use(errorHandler())
// Middleware for serving static files, such as HTML, CSS, JavaScript, images, and other assets, from a directory named
// 'public'. path.join(__dirname, 'public') constructs the absolute path to the 'public' directory based on the current
// directory of the script('__dirname')
app.use(express.static(path.join(__dirname, 'public')))

// Middleware to add prismic content
// Sets up several variables and functions that can be accessed in templates, views, or subsequent middleware.
app.use((req, res, next) => {
  // Sets a property called ctx on the res.locals object. The res.locals object holds response local variables, making
  // them available to templates and views in the application.
  res.locals.ctx = {
    // Assigns the value of PRISMIC_ENDPOINT.
    endpoint: process.env.PRISMIC_ENDPOINT,
    // Assigns the value of the handleLinkResolver function.
    linkResolver: handleLinkResolver
  }

  // Adds a property named Prismic to the res.locals object and assigns it the value of the Prismic object.
  res.locals.Prismic = Prismic
  // Adds a property named Link in the res.locals object and assigns it the value of the handleLinkResolver function.
  res.locals.Link = handleLinkResolver
  // Defines a function valued Numbers and assigns it to the res.locals object. This function takes an index parameter and
  // returns a string based on the index value.
  res.locals.Numbers = index => {
    return index == 0
      ? 'One'
      : index == 1
        ? 'Two'
        : index == 2
          ? 'Three'
          : index == 3
            ? 'Four'
            : ''
  }

  // The next() function is called here. This is crucial in middleware because it passes control to the next
  // middleware function in the application's request-response cycle. It allows the application to continue processing
  // the request after this middleware has executed.
  next()
})

// Handle API request to fetch data from the Prismic CMS.
// Asynchronous arrow function that takes one parameter api.
const handleRequest = async (api) => {
  // Variables to recieve the data fetched from each coresponding documents.
  // The { results: collections } extracts the results property from the resolved value of the last promise. It assigns
  // the results property to the collections variable. The collections variable contains an array of documents of type collection.
  try {
    const [meta, preloader, navigation, home, about, { results: collections }] = await Promise.all([
      api.getSingle('meta'),
      api.getSingle('preloader'),
      api.getSingle('navigation'),
      api.getSingle('home'),
      api.getSingle('about'),
      api.get({
        filters: [Prismic.filter.at('document.type', 'collection')],
        fetchLinks: 'product.image'
      })
    ])

    if (!meta) {
      console.error('No "meta" document found.')
      // Handle this scenario, e.g., set default values or return an error response.
      // You may also choose to throw a custom error to be caught in the catch block.
    }

    // Initializing an empty array named assets. This array will be used to collect URLs of images from certain documents fields.
    const assets = []

    // Iterating through the gallery field of the about documents data and pushes the URLs of the images in the gallery to the
    // assets array.
    about.data.gallery.forEach((item) => {
      assets.push(item.image.url)
    })

    // Iterating through the body field of the about documents data and checks if each section has a slice_type equal to gallery.
    // If a section is a gallery section, it further iterates through the items within the section and pushes the URLs of the
    // images to the assets array.
    about.data.body.forEach((section) => {
      if (section.slice_type === 'gallery') {
        section.items.forEach((item) => {
          assets.push(item.image.url)
        })
      }
    })

    // The function returns an object containing various pieces of data collected from the API requests and images URLs.
    return {
      assets,
      meta,
      home,
      collections,
      about,
      navigation,
      preloader
    }
  } catch (error) {
    console.error('Error handling API request:', error)
    throw error // Rethrow the error to propagate it to the caller
  }
}

// Configuring the Express.js application to use the Pug templating engine for rendering views.
// Configures the views setting. In Express, the views setting specifies the directory where the application should look for
// view templates. The path.join(__dirname, 'views') constructs an absolute path by joining the current directory (__dirname)
// with the views directory. This assumes that the views directory is located in the same directory as the script file.
// So basically it tells Express to look for the view templates in the views directory of the current project.
app.set('views', path.join(__dirname, 'views'))
// Sets the view engine setting for the Express application. The view engine setting specifies which template engine should
// be used for rendering views. In this case, we want to set it to use the pug template engine to render views.
app.set('view engine', 'pug')
// Sets a local variable named basedir in the Express apllication's locals object app.locals. The locals object is a way to
// pass variables to view templates so that they can be used during rendering. The app.get('views') retrieves the value of the
// views setting that was previously configured. This value represents the directory where view templates are located.
// The basedir variable is set to the same directory as the views setting, effectively specifying the base directory for relative
// paths within the Pug templates. It allows Pug templates to use relative paths when including or extending other templates.
// So basically the basedir variable helps templates to know where to find other files when they need them, by acting as a
// starting point.
app.locals.basedir = app.get('views')

// Route handler for HTTP GET request to the root path ('/').
// The incomming requests are handled by the Express.js framework to render the web page.
// When a user visits the main page of the website, this code will be executed.
app.get('/', async (req, res) => {
  // Initializing an API client by calling the initApi function and passing the req object as an argument.
  // The await indicates that this operation is asynchronous and must wait for the initApi function to complete before proceeding.
  // The initApi function sets up and returns an API client to connect to the Prismic CMS.
  const api = await initApi(req)
  // Calling the handleRequest function, passing the API client (api) as an argument.
  // The handleRequest function is responsible for making various API requests to fetch data, and it returns an object
  // containing the fetched data. This object is stored in the defaults variable.
  const defaults = await handleRequest(api)

  // Rendering the HTML page using a view template called 'pages/home' and sends it as the repsonse to the client.
  res.render('pages/home', {
    // ...defaults spreads the properties of the defaults object as variables that can be accessed within the view template.
    // In other words, it passed the data fetched from the API (stored in defaults) to the 'pages/home' template so that the
    // template can use this data to render the page dynamically.
    ...defaults
  })
})

app.get('/about', async (req, res) => {
  const api = await initApi(req)
  const defaults = await handleRequest(api)

  res.render('pages/about', {
    ...defaults
  })
})

// HTTP GET requests to the path '/detail/:uid, where :uid is a route parameter representing a unique identifier.
app.get('/detail/:uid', async (req, res) => {
  console.log('REQUEST')
  const api = await initApi(req)
  const defaults = await handleRequest(api)

  // API request to the PRISMIC CMS using the getByUID method. It fetches a document of type 'product' with a specific UID
  // (unique identifier) provided in the URL parameters ('req.params.uid').
  // The fetchLinks: 'collection.title part specifies that it should also fetch linked data, particularly the collection type
  // with its title field. The result is stored in the product variable.
  const product = await api.getByUID('product', req.params.uid, {
    fetchLinks: 'collection.title'
  })

  console.log(product)

  res.render('pages/detail', {
    ...defaults,
    product
  })
})

app.get('/collections', async (req, res) => {
  const api = await initApi(req)
  const defaults = await handleRequest(api)

  console.log(defaults.collections)

  res.render('pages/collections', {
    ...defaults
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
