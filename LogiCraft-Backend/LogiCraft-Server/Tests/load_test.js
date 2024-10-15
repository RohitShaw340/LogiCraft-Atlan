import http from "k6/http";
import { check, sleep } from "k6";

// Define the number of virtual users and test duration
export const options = {
  stages: [
    { duration: "1m", target: 100 }, // Ramp up to 100 users over 1 minute
    { duration: "2m", target: 1000 }, // Stay at 1000 users for 2 minutes
    { duration: "1m", target: 0 }, // Ramp down to 0 users
  ],
};

export default function () {
  const baseUrl = "http://localhost:4001";

  // Example endpoints to test
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
    "response time < 200ms": (r) => r.timings.duration < 200,
  });

  sleep(1); // 1 second sleep to simulate real user behavior
}
