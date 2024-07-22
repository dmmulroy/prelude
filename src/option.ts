import { UnwrapError } from "./result";

/**
 * Represents an option type that can either be Some or None.
 *
 * @template A The type of the contained value.
 */
export type Option<A> = Some<NonNullable<A>> | None;

export const Option = {
  /**
   * Creates a Some Option.
   *
   * @template A The type of the value.
   *
   * @param {A} value The value to encapsulate in the Some Option.
   *
   * @returns {Some<A>} A Some Option containing the value.
   */
  some<A>(value: NonNullable<A>): Some<NonNullable<A>> {
    return new Some(value) as Some<NonNullable<A>>;
  },

  /**
   * Creates a None Option.
   *
   * @returns {None} A None Option.
   */
  none(): None {
    return new None();
  },

  /**
   * Creates an Option from a nullable value.
   *
   * @template A - The type of the value.
   *
   * @param {A} value - The value to create an Option from. If the value is null
   * or undefined, it returns None. Otherwise, it returns Some.
   *
   * @returns {Option<A>} An Option containing the value if it is not null or
   * undefined, otherwise None.
   */
  fromNullable<A>(value: A): Option<NonNullable<A>> {
    if (value) {
      return Option.some(value);
    }

    return Option.none();
  },
};

/**
 * A type representing a matcher with handlers for `ok` and `err` cases.
 *
 * @template A - The type of the value in the `ok` case.
 * @template B - The type of the result after applying the matcher.
 */
export type OptionMatcher<A, B> = Readonly<{
  /**
   * A function to handle the `some` case.
   *
   * @param {NonNullable<A>} value - The value to be handled in the `some` case.
   * @returns {B} The result after handling the `some` value.
   */
  some: (value: NonNullable<A>) => B;

  /**
   * A function to handle the `none` case.
   *
   * @param {E} value - The value to be handled in the `none` case.
   * @returns {B} The result after handling the `none` value.
   */
  none: () => B;
}>;

/**
 * Represents the Some variant of an Option.
 *
 * @template A - The type of the contained value.
 */
class Some<A> {
  /**
   * A constant tag to identify this instance as "some".
   */
  readonly _tag = "some" as const;

  /**
   * Creates an instance of Some.
   *
   * @param {A} value - The contained value.
   */
  constructor(private readonly value: NonNullable<A>) {}

  /**
   * Checks if the option is Some.
   *
   * @returns {boolean} True if the option is Some.
   */
  isSome(): this is Some<A> {
    return true;
  }

  /**
   * Checks if the option is None.
   *
   * @returns {boolean} False since this is Some.
   */
  isNone(): this is None {
    return false;
  }

  /**
   * Maps the value contained in Some using the provided function.
   *
   * @template B - The type of the value after applying the function.
   *
   * @param {(value: A) => B} fn - The function to apply to the value.
   *
   * @returns {Some<B>} A new Some instance containing the result of the function.
   */
  map<B>(fn: (value: A) => NonNullable<B>): Some<B> {
    return Option.some(fn(this.value));
  }

  /**
   * Applies the provided function to the value contained in Some, chaining the
   * results.
   *
   * @template B - The type of the value in the result of the function.
   *
   * @param {(value: A) => Option<NonNullable<B>>} fn - The function applied to
   * the value.
   *
   * @returns {Option<B>} The result of applying the function.
   */
  andThen<B>(fn: (value: A) => Option<NonNullable<B>>): Option<B> {
    return fn(this.value);
  }

  /**
   * Matches the option using the provided matcher.
   *
   * @template B - The type of the result after applying the matcher.
   *
   * @param {OptionMatcher<A,  B>} matcher - The matcher to apply.
   *
   * @returns {B} The result of the matcher.
   */
  match<B>(matcher: OptionMatcher<A, B>): B {
    return matcher.some(this.value);
  }

  /**
   * Unwraps the value contained in the `Option`, throwing an error with the
   * provided message if the value is `None`.
   *
   * @param {string} [_message] - The message for the error (optional).
   *
   * @returns {A} The contained value.
   */
  unwrap(_message?: string): A {
    return this.value;
  }

  /**
   * Unwraps the value contained in Some or returns the provided default value.
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
}

/**
 * Represents the None variant of an Option.
 */
class None {
  /**
   * A constant tag to identify this instance as "none".
   */
  readonly _tag = "none" as const;

  /**
   * Checks if the option is Some.
   *
   * @returns {boolean} False since this is None.
   */
  isSome(): this is Some<unknown> {
    return false;
  }

  /**
   * Checks if the option is None.
   *
   * @returns {boolean} True if the option is None.
   */
  isNone(): this is None {
    return true;
  }

  /**
   * Maps the value contained in None, returning the current None instance.
   *
   * @template B - The type of the value after applying the function.
   *
   * @param {(value: never) => B} _fn - The function to apply to the value (ignored).
   *
   * @returns {None} The current None instance.
   */
  map<B>(_fn: (value: never) => B): None {
    return this;
  }

  /**
   * Applies the provided function to the value contained in None, returning the current None instance.
   *
   * @template B - The type of the value in the result of the function.
   *
   * @param {(value: never) => Option<B>} _fn - The function to apply to the value (ignored).
   *
   * @returns {None} The current None instance.
   */
  andThen<B>(_fn: (value: never) => Option<B>): None {
    return this;
  }

  /**
   * Matches the option using the provided matcher.
   *
   * @template B - The type of the result after applying the matcher.
   *
   * @param {OptionMatcher<never, void, B>} matcher - The matcher to apply.
   *
   * @returns {B} The result of the matcher.
   */
  match<B>(matcher: OptionMatcher<never, B>): B {
    return matcher.none();
  }

  /**
   * Unwraps the value contained in the `Option`, throwing an error with the
   * provided message if the value is `None`.
   *
   * @param {string} [message] - The message for the error (optional).
   *
   * @returns {A} The contained value.
   */
  unwrap(message?: string): never {
    throw new UnwrapError(message ?? "Option is none");
  }

  /**
   * Unwraps the value contained in None or returns the provided default value.
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
}
