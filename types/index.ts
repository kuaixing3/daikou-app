import type { Timestamp } from 'firebase/firestore';

/**
 * User role
 * - `user`: General user
 * - `driver`: Driver user
 */
export type UserRole = 'user' | 'driver';

/**
 * User profile stored in Firestore
 * `users/{userId}`
 */
export interface UserProfile {
  role: UserRole;
  isOnline?: boolean; // For drivers
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Ride request status
 * - `searching`: User is looking for a driver
 * - `matched`: A driver has accepted the request
 * - `completed`: The ride is completed
 * - `cancelled`: The ride is cancelled
 */
export type RideRequestStatus = 'searching' | 'matched' | 'completed' | 'cancelled';

/**
 * Geolocation data
 */
export interface Location {
  latitude: number;
  longitude: number;
}

/**
 * Ride request data stored in Firestore
 * `rideRequests/{requestId}`
 */
export interface RideRequest {
  userId: string;
  status: RideRequestStatus;
  pickupLocation: Location;
  createdAt: Timestamp;
  driverId?: string;
  updatedAt?: Timestamp;
}
