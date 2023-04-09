export function isPromiseOrAsyncFn(fn: any) {
  const type = Object.prototype.toString.call(fn);
  return (type === '[object Promise]') || (type === '[object AsyncFunction]');
}