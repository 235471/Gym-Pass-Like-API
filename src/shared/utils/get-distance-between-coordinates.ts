export interface Coordinate {
  latitude: number
  longitude: number
}

export function getDistanceBetweenCoordinates(
  from: Coordinate,
  to: Coordinate,
): number {
  if (from.latitude === to.latitude && from.longitude === to.longitude) {
    return 0
  }
  const earthRadiusInMeters = 6371000 // Earth's radius in meters

  // Convert degrees to radians
  const latFromRad = (from.latitude * Math.PI) / 180
  const latToRad = (to.latitude * Math.PI) / 180
  const latDelta = ((to.latitude - from.latitude) * Math.PI) / 180
  const lngDelta = ((to.longitude - from.longitude) * Math.PI) / 180

  // Haversine formula
  const a =
    Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
    Math.cos(latFromRad) *
      Math.cos(latToRad) *
      Math.sin(lngDelta / 2) *
      Math.sin(lngDelta / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  // Distance in meters
  const distance = earthRadiusInMeters * c

  return distance
}
