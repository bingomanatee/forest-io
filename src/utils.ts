export const ABSENT = Symbol('absent');
export const NOOP = () => null;

export function resultOrThrown(fn) {
  try {
    return fn();
  } catch (err) {
    return err;
  }
}

export function errMessage(err) {
  if (err && typeof err === 'object') {
    if ('message' in err) return err.message;
  }
  return err;
}
