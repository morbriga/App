/* Custom camera styles */
.bg-confetti {
  background-color: #000;
  background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ff4081' fill-opacity='0.3' fill-rule='evenodd'%3E%3Cpath d='M0 20h10v10H0V20zm10 0h10v10H10V20zm10 0h10v10H20V20z'/%3E%3C/g%3E%3C/svg%3E");
}

.bg-hearts {
  background-color: #000;
  background-image: url("data:image/svg+xml,%3Csvg width='48' height='48' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' fill='%23ff4081' fill-opacity='0.3'/%3E%3C/svg%3E");
}

/* Capture button animation */
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(255, 255, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
  }
}

.pulse {
  animation: pulse 2s infinite;
}