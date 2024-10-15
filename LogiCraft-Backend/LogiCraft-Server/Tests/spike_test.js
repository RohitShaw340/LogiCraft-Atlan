import http from "k6/http";
import { check, sleep } from "k6";

// Define spike test configuration
export const options = {
  stages: [
    { duration: "10s", target: 1000 }, // Ramp up to 1000 users in 10 seconds
    { duration: "10s", target: 10000 }, // Spike to 10,000 users in 10 seconds
    { duration: "10s", target: 5000 }, // Stay at 5,000 users for 10 seconds
    { duration: "5s", target: 0 }, // Ramp down to 0 users
  ],
};

export default function () {
  const baseUrl = "http://localhost:8080";

  const urls = [
    `${baseUrl}/bookings`,
    `${baseUrl}/vehicles`,
    `${baseUrl}/assignments`,
    `${baseUrl}/analysis/bookings`,
    `${baseUrl}/analysis/vehicles`,
    `${baseUrl}/analysis/drivers`,
  ];

  // Randomly select one of the URLs to simulate concurrent traffic across multiple endpoints
  const url = urls[Math.floor(Math.random() * urls.length)];

  // Send a request to server
  const response = http.get(url);

  // Check if the response status is 200 (OK)
  check(response, {
    "status was 200": (r) => r.status === 200,
    "response time < 1000ms": (r) => r.timings.duration < 1000,
  });

  sleep(1); // 1 second pause
}
