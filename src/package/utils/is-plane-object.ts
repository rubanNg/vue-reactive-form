export function isPlaneObject(value: any) {
  return Object.prototype.toString.call(value) === '[object Object]'
}