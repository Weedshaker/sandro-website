class MasterServiceWorker {
	constructor(){
		this.name = 'ServiceWorker'
		this.version = 'v1'
		this.precache = [
			'./',
			'./index.html',
			'./favicon.gif'
		]
		this.doNotIntercept = ['analytics.js']
		this.doIntercept = [location.origin]
	}
	run(){
		this.addInstallEventListener()
		this.addFetchEventListener()
	}
	// onInstall init cache
	addInstallEventListener() {
		self.addEventListener('install', event => event.waitUntil(caches.open(this.version).then(cache => cache.addAll(this.precache))))
	}
	// intercepts fetches, asks cache for fast response and still fetches and caches afterwards
	addFetchEventListener() {
		self.addEventListener('fetch', event => event.respondWith(
			this.doNotIntercept.every(url => !event.request.url.includes(url)) && this.doIntercept.every(url => event.request.url.includes(url))
				? new Promise((resolve, reject) => {
					let counter = 0
					let didResolve = false
					const doResolve = response => {
						counter++
						if(!didResolve){
							if(response){
								didResolve = true
								resolve(response)
							}else if (counter === 2){
								reject(response)
							}
						}
						return response || new Error('no response')
					}
					// race fetch vs. cache to resolve
					this.getFetch(event).then(response => doResolve(response)).catch(error => console.info(`Can't fetch ${event.request.url}`, error)) // start fetching and caching
					this.getCache(event).then(response => doResolve(response)).catch(error => console.info(`Can't get cache ${event.request.url}`, error)) // grab cache
				})
				: fetch(event.request)
		))
	}
	async getCache(event){
		return await caches.match(event.request)
	}
	async getFetch(event){
		return await fetch(event.request).then(
			response => caches.open(this.version).then(
				cache => {
					//console.log('cached', event.request.url)
					cache.put(event.request, response.clone())
					return response
				}
			)
		)
	}
}
const ServiceWorker = new MasterServiceWorker()
ServiceWorker.run()