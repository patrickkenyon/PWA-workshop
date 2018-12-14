var log = console.log.bind(console) // bind our variable to a variable
var version = "0.0.10"
var cacheName = "todos"
var cache = cacheName + "-" + version
var filesToCache = [
    "http://localhost:8888/css/style.css",
    "http://localhost:8888/js/app.js",
    "http://localhost:8888/js/localforage.js",
    "http://localhost:8888/images/icons/favicons.ico",
    "http://localhost:8888/images/icons/icon-144x144.ico",
    "http://localhost:8888/manifest.json",
    "http://localhost:8888/",
    "http://localhost:8888/index.php",
    "http://localhost:8888/done", // this is a flat html page so that can be cached immediately
]

importScripts('js/localforage.js')

self.addEventListener("install", function(event) {
    log('[ServiceWorker) Installing...')

    event.waitUntil(caches
        .open(cache)
        .then(function(swcache) { // open this cache from caches and it will return a Promise
            log('[ServiceWorker] Caching files') // catching that promise
            return swcache.addAll(filesToCache) // add all required files to it it also returns a Promise
        })
    )
})

// we have now added all the files to the cache that the front end might need
// for the app to work. Need to tell

self.addEventListener("fetch", function(event) {
    if (filesToCache.includes(event.request.url)) {
        event.respondWith(
            caches.match(event.request)
                .then(function(response) {
                    if (response) {
                        log("Fulfilling "+event.request.url+" from cache.")
                    //    this returns the response object
                        return response
                    } else {
                        log(event.request.url+" not found in cache, fetching from network.")
                    //    return promise that resolves to object
                        return fetch(event.request)
                    }
                })
        )
    }

    if (event.request.url === 'http://localhost:8888/api/todo' && event.request.method == 'GET') {

        event.respondWith(async function() {

            let response = await fetch (event.request).catch(async function(err) {
                var data = {success:true, msg:'', data: []}

                await localforage.iterate(function (value, key) {
                    data.data.push([key, value])
                })

                if (data.data.length > 0) {
                    log('Returning cached data')
                    return await new Response(JSON.stringify(data), {
                        headers: {"Content-type": "application/json"}
                    })
               }
            }) //this section saves the data offline so that if can be displayed on the browser even when offline

            // clone response as it can only be used once and needs to be returned to clients browser
            let responseData = await response.clone().json()
            await localforage.clear()
            log (responseData)
            await responseData.data.forEach(function (todo) {
                localforage.setItem(todo[0], todo[1])
            })

            return response

        }()) // don't forget to call immediately
    }
})