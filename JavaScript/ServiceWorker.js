export default class ServiceWorker {
	constructor(serviceWorkerPath = './MasterServiceWorker.js', serviceWorkerScope = './'){
		this.serviceWorkerPath = serviceWorkerPath
		this.serviceWorkerScope = serviceWorkerScope
		
		this.name = 'ServiceWorker'
	}
	run(){
		if(navigator.serviceWorker){
			this.register()
		}else{
			console.warn('SST:Service Worker is not supported in this browser.')
		}
	}
	// register the service worker
	register() {
		navigator.serviceWorker
			.register(this.serviceWorkerPath, { scope: this.serviceWorkerScope })
			// .then(reg => console.log('Registration succeeded. Scope is ' + reg.scope)) //registration => registration.update())
			.catch(e => console.log('Registration failed with ' + e))
	}
}