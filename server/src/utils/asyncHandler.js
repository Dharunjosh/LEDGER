// Wraps an async route function so any thrown error / rejected promise
// is forwarded to next(err) automatically, instead of needing a try/catch
// in every single controller.
export default function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
