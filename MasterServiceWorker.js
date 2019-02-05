class MasterServiceWorker {
	constructor(){
		this.name = 'ServiceWorker'
		this.version = 'v1'
		this.precache = ['./']
		this.doNotIntercept = ['analytics.js'];
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
			this.doNotIntercept.every(url => !event.request.url.includes(url))
			? new Promise(resolve => {
				this.getFetch(event).then(response => response && resolve(response))
				this.getCache(event).then(response => response && resolve(response))
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
					//console.log('cached', event.request.url);
					cache.put(event.request, response.clone())
					return response
				}
			)
		).catch(e => console.info('you are offline!', e))
	}
}
const ServiceWorker = new MasterServiceWorker()
ServiceWorker.run()