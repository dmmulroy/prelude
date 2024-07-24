import { TaggedError } from "./error";

/**
 * Represents a type that can either be a successful result (Ok) or an error
 * result (Err).
 *
 * @template A The type of the successful value.
 * @template E The type of the error.
 */
export type Result<A, E> = Ok<A> | Err<E>;

export const Result = {
  /**
   * Creates an Ok Result.
   *
   * @template A The type of the value.
   *
   * @param {A} value The value to encapsulate in the Ok Result.
   *
   * @returns {Ok<A>} An Ok Result containing the value.
   */
  ok<A>(value: A): Ok<A> {
    return new Ok(value);
  },

  /**
   * Creates an Error Result.
   *
   * @template E The type of the error.
   *
   * @param {E} value The error to encapsulate in the Error Result.
   *
   * @returns {Err<E>} An Error Result containing the error.
   */
  err<E>(value: E): Err<E> {
    return new Err(value);
  },

  /**
   * Attempts to execute a function and captures any errors that occur,
   * returning a `Result` type.
   *
   * @template A - The type of the successful result.
   *
   * @param {() => A} fn - The function to execute.
   *
   * @returns {Result<A, TryCatchError>}
   * A `Result` containing either the successful result or an error.
   */
  try<A>(fn: () => A): Result<A, TryCatchError> {
    try {
      const result = fn();

      return Result.ok(result);
    } catch (error) {
      return Result.err(new TryCatchError({ cause: error }));
    }
  },

  /**
   * Attempts to execute a async function and captures any errors that occur,
   * returning a `Result` type.
   *
   * @template A - The type of the successful result.
   *
   * @param {() => Promise<A>} fn - The function to execute.
   *
   * @returns {Promise<Result<A, TryCatchError>>} A `Result` containing either
   * the successful result or an error.
   */
  async asyncTry<A>(fn: () => Promise<A>): Promise<Result<A, TryCatchError>> {
    try {
      const result = await fn();

      return Result.ok(result);
    } catch (error) {
      return Result.err(new TryCatchError({ cause: error }));
    }
  },
};

export class UnwrapError extends TaggedError {
  readonly _tag = "UnwrapError" as const;
}

export class TryCatchError extends TaggedError {
  readonly _tag = "TryCatchError" as const;

  constructor(options: ErrorOptions & { cause: unknown }) {
    super("TryCatchError", options);
  }
}

/**
 * A type representing a matcher with handlers for `ok` and `err` cases.
 *
 * @template A - The type of the value in the `ok` case.
 * @template E - The type of the value in the `err` case.
 * @template B - The type of the result after applying the matcher.
 */
export type ResultMatcher<A, E, B> = Readonly<{
  /**
   * A function to handle the `ok` case.
   *
   * @param {A} value - The value to be handled in the `ok` case.
   * @returns {B} The result after handling the `ok` value.
   */
  ok: (value: A) => B;

  /**
   * A function to handle the `err` case.
   *
   * @param {E} value - The value to be handled in the `err` case.
   * @returns {B} The result after handling the `err` value.
   */
  err: (value: E) => B;
}>;

/**
 * Represents a successful result.
 *
 * @template A - The type of the successful value.
 */
class Ok<A> {
  /**
   * A constant tag to identify this instance as "ok".
   */
  readonly _tag = "ok" as const;

  /**
   * Creates an instance of Ok.
   *
   * @param {A} value - The successful value.
   */
  constructor(private readonly value: A) {}

  /**
   * Checks if the result is an `Ok`.
   *
   * @returns {boolean} True if the result is an `Ok`.
   */
  isOk(): this is Ok<A> {
    return true;
  }

  /**
   * Checks if the result is an `Err`.
   *
   * @returns {boolean} False since this is an `Ok`.
   */
  isErr(): this is Err<unknown> {
    return false;
  }

  /**
   * Maps the value contained in the `Ok` using the provided function.
   *
   * @template B - The type of the value after applying the function.
   *
   * @param {(value: A) => B} fn - The function to apply to the value.
   *
   * @returns {Ok<B>} A new `Ok` instance containing the result of the function.
   */
  map<B>(fn: (value: A) => B): Ok<B> {
    return Result.ok(fn(this.value));
  }

  /**
   * Maps the error value if the result is an `Err`, otherwise returns the
   * current `Ok` instance.
   *
   * @template E - The type of the original error value.
   *
   * @template F - The type of the error value after applying the function.
   *
   * @param {(value: E) => F} _fn - The function to apply to the error value
   * (ignored).
   *
   * @returns {Ok<A>} The current `Ok` instance.
   */
  mapError<F>(_fn: (value: never) => F): Ok<A> {
    return this;
  }

  /**
   * Applies the provided function to the value contained in the `Ok`, chaining
   * the results.
   *
   * @template B - The type of the value in the result of the function.
   *
   * @template E - The type of the error in the result of the function.
   *
   * @param {(value: A) => Result<B, E>} fn - The function applied to the value.
   *
   * @returns {Result<B, E>} The result of applying the function.
   */
  andThen<B, E>(fn: (value: A) => Result<B, E>): Result<B, E> {
    return fn(this.value);
  }

  /**
   * Matches the result using the provided matcher.
   *
   * @template B - The type of the result after applying the matcher.
   *
   * @param {ResultMatcher<A, never, B>} matcher - The matcher to apply.
   *
   * @returns {B} The result of the matcher.
   */
  match<B>(matcher: ResultMatcher<A, never, B>): B {
    return matcher.ok(this.value);
  }

  /**
   * Unwraps the value contained in the `Result`, throwing an error with the
   * provided message if the value is an `Err`.
   *
   * @param {string} [_message] - The message for the error (optional).
   *
   * @throws {Error} An error indicating that the result is `Err`.
   */
  unwrap(_message?: string): A {
    return this.value;
  }

  /**
   * Unwraps the value contained in `Ok` or returns the provided default value.
   *
   * @template B - The type of the default value.
   *
   * @param {B} _or - The default value (ignored).
   *
   * @returns {A} The contained value.
   */
  unwrapOr<B>(_or: B): A {
    return this.value;
  }

  /**
   * Unwraps the error value contained in `Err`, throwing an error since this is
   * an `Ok`.
   *
   * @throws {Error} An error indicating that the result is `Ok`.
   */
  unwrapError(): never {
    throw new UnwrapError(`Result is ok: ${this.value}`);
  }
}

/**
 * Represents an erroneous result.
 *
 * @template E - The type of the error value.
 */
class Err<E> {
  /**
   * A constant tag to identify this instance as "err".
   */
  readonly _tag = "err" as const;

  /**
   * Creates an instance of Err.
   *
   * @param {E} value - The error value.
   */
  constructor(private readonly value: E) {}

  /**
   * Checks if the result is an `Ok`.
   *
   * @returns {boolean} False since this is an `Err`.
   */
  isOk(): this is Ok<unknown> {
    return false;
  }

  /**
   * Checks if the result is an `Err`.
   *
   * @returns {boolean} True if the result is an `Err`.
   */
  isErr(): this is Err<E> {
    return true;
  }

  /**
   * Maps the value contained in the `Err`, returning the current `Err`
   * instance.
   *
   * @template B - The type of the value after applying the function.
   *
   * @param {(value: never) => B} _fn - The function to apply to the value
   * (ignored).
   *
   * @returns {Err<E>} The current `Err` instance.
   */
  map<B>(_fn: (value: never) => B): Err<E> {
    return this;
  }

  /**
   * Maps the error value using the provided function.
   *
   * @template F - The type of the error value after applying the function.
   *
   * @param {(value: E) => F} fn - The function to apply to the error value.
   *
   * @returns {Err<F>} A new `Err` instance containing the result of the
   * function.
   */
  mapError<F>(fn: (value: E) => F): Err<F> {
    return Result.err(fn(this.value));
  }

  /**
   * Applies the provided function to the value contained in the `Err`,
   * returning the current `Err` instance.
   *
   * @template B - The type of the value in the result of the function.
   *
   * @template F - The type of the error in the result of the function.
   *
   * @param {(value: never) => Result<B, F>} _fn - The function to apply to the
   * value (ignored).
   *
   * @returns {Err<E>} The current `Err` instance.
   */
  andThen<B, F>(_fn: (value: never) => Result<B, F>): Err<E> {
    return this;
  }

  /**
   * Matches the result using the provided matcher.
   *
   * @template B - The type of the result after applying the matcher.
   *
   * @param {ResultMatcher<never, E, B>} matcher - The matcher to apply.
   *
   * @returns {B} The result of the matcher.
   */
  match<B>(matcher: ResultMatcher<never, E, B>): B {
    return matcher.err(this.value);
  }

  /**
   * Unwraps the value contained in the `Result`, throwing an error with the
   * provided message if the value is an `Err`.
   *
   * @param {string} [message] - The message for the error (optional).
   *
   * @throws {Error} An error indicating that the result is `Err`.
   */
  unwrap(message?: string): never {
    throw new UnwrapError(message ?? `Result is error: ${this.value}`);
  }

  /**
   * Unwraps the value contained in the `Err` or returns the provided default
   * value.
   *
   * @template B - The type of the default value.
   *
   * @param {B} or - The default value.
   *
   * @returns {B} The provided default value.
   */
  unwrapOr<B>(or: B): B {
    return or;
  }

  /**
   * Unwraps the error value contained in the `Err`.
   *
   * @returns {E} The contained error value.
   */
  unwrapError(): E {
    return this.value;
  }
}
