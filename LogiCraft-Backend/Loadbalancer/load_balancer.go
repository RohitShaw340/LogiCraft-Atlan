package main

import (
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"sync"
	"time"
)

type Backend struct {
	URL          *url.URL
	Alive        bool
	mux          sync.RWMutex
	ReverseProxy *httputil.ReverseProxy
}

type LoadBalancer struct {
	backends []*Backend
	current  int
}

func (b *Backend) SetAlive(alive bool) {
	b.mux.Lock()
	b.Alive = alive
	b.mux.Unlock()
}

func (b *Backend) IsAlive() bool {
	b.mux.RLock()
	alive := b.Alive
	b.mux.RUnlock()
	return alive
}

func (lb *LoadBalancer) NextBackend() *Backend {
	lb.current = (lb.current + 1) % len(lb.backends)
	return lb.backends[lb.current]
}

func (lb *LoadBalancer) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	peer := lb.NextBackend()
	if peer.IsAlive() {
		peer.ReverseProxy.ServeHTTP(w, r)
		return
	}
	http.Error(w, "Service not available", http.StatusServiceUnavailable)
}

func healthCheck(backend *Backend) {
	client := &http.Client{
		Timeout: 2 * time.Second,
	}
	resp, err := client.Get(backend.URL.String())
	if err != nil {
		log.Printf("Backend %v is down\n", backend.URL)
		backend.SetAlive(false)
		return
	}
	defer resp.Body.Close()
	if resp.StatusCode == http.StatusOK {
		log.Printf("Backend %v is up\n", backend.URL)
		backend.SetAlive(true)
		return
	}
	backend.SetAlive(false)
}

func main() {
	backends := []string{
		"http://localhost:4001",
		"http://localhost:4002",
		"http://localhost:4003",
		"http://localhost:4004",
	}

	lb := &LoadBalancer{}

	for _, b := range backends {
		u, _ := url.Parse(b)
		proxy := httputil.NewSingleHostReverseProxy(u)
		lb.backends = append(lb.backends, &Backend{
			URL:          u,
			Alive:        true,
			ReverseProxy: proxy,
		})
	}

	// Run a health check on each backend every 5 seconds
	for _, b := range lb.backends {
		go func(backend *Backend) {
			for {
				healthCheck(backend)
				time.Sleep(5 * time.Second)
			}
		}(b)
	}

	server := http.Server{
		Addr:    ":8080",
		Handler: lb,
	}

	log.Println("Load Balancer started on :8080")
	if err := server.ListenAndServe(); err != nil {
		log.Fatal(err)
	}
}
