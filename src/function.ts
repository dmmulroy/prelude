import { Pipe } from "sloth-pipe";

export const Fn = {
  /**
   * Creates a `ComposableFunction` from a given function.
   * This `ComposableFunction` can then be composed with other functions using
   * its `compose` method.
   *
   * @template Input The input type of the provided function.
   *
   * @template Output The output type of the provided function.
   *
   * @param {(arg: Input) => Output} fn The function to transform into are
   * `ComposableFunction`.
   *
   * @returns {ComposableFunction<Input, Output>} The created
   * `ComposableFunction`.
   */
  compose<Input, Output>(
    fn: (arg: Input) => Output,
  ): ComposableFunction<Input, Output> {
    const composeFunction = (arg: Input) => fn(arg);

    composeFunction.compose = <NextOutput>(
      nextFn: (arg: Output) => NextOutput,
    ) => {
      return Fn.compose((input: Input) => nextFn(fn(input)));
    };

    return composeFunction;
  },

  /**
   * Creates a function that returns the same value that is used as the
   * argument of the `constant` function.
   *
   * @template A The type of the value to be returned.
   *
   * @param {A} value The value to be returned by the constant function.
   *
   * @returns {Function} A function that, when called, always returns the
   * provided value, irrespective of the arguments it is passed.
   *
   * @example
   * ```javascript
   * const alwaysFive = constant(5);
   * alwaysFive(); // Returns 5
   * alwaysFive(10, 20); // Still returns 5, ignoring the arguments
   * ```
   */
  constant<A>(value: A): <U>(...args: U[]) => A {
    return (..._args) => value;
  },

  /**
   * Returns the value passed in.
   * @template A The type of the value.
   *
   * @param {A} value The value to return.
   *
   * @returns {A} The value passed in.
   */
  identity<A>(value: A): A {
    return value;
  },

  /**
   * Flips the order of the arguments of a binary function.
   *
   * @param {Function} fn The function to flip.
   *
   * @returns {Function} A new function with the arguments flipped.
   *
   * @example
   * ```javascript
   * const numerator = 10;
   * const denominator = 2;
   *
   * const divide = (numerator, denominator) => numerator / denominator;
   * divide(numerator, denominator) // Returns 5
   *
   * const flippedDivide = flip(divide);
   * flippedDivide(denominator, numerator) // Returns 5
   */
  flip<A, B, R>(fn: (first: A, second: B) => R): (first: B, second: A) => R {
    return (first: B, second: A) => fn(second, first);
  },

  /**
;  * Executes the provided function on a given value as a side effect and
   * returns the original value. This function is primarily used for executing
   * side effects within a pipeline. If the provided function is asynchronous,
   * it is called but not awaited. Errors thrown by the function, either
   * synchronous or asynchronous, are ignored, and the original value is still
   * returned.
   *
   * @template A The type of the value being processed.
   *
   * @param {(value: A) => void | Promise<void>} fn The function to execute as a
   * side effect. It should either return void or a Promise resolving to void.
   *
   * @param {A} value The value to be passed to the function.
   * @returns {A} The original value, irrespective of any errors thrown by `fn`.
   */
  tap<A>(fn: (value: A) => void | Promise<void>, value: A): A {
    try {
      const result = fn(value);
      if (result instanceof Promise) {
        result.catch(() => {});
      }
      return value;
    } catch (_) {
      return value;
    }
  },

  /**
   * A utility function to create a pipeable value.
   *
   * @template A - The type of the value to be piped.
   *
   * @param {A} value - The initial value to be piped.
   *
   * @returns {Pipeable<A>} - An object that supports method chaining for the
   * given value.
   *
   * @example
   * const result = Pipe(5)
   *    .to((value) => value * 2)
   *    .to((value) => value + 3)
   *    .exec();
   *
   * console.log(result); // Outputs: 13
   */
  pipe: Pipe,
} as const;

/**
 * Represents a function that can be composed with other functions. It takes an
 * input of type `Input` and returns an output of type `Output`. It also
 * includes a `compose` method for chaining additional functions to create a new
 * `ComposableFunction`.
 *
 * @template Input The input type of the function.
 *
 * @template Output The output type of the function.
 */
export interface ComposableFunction<Input, Output> {
  /**
   * The call signature for the `ComposableFunction`. When invoked, it takes an
   * argument of type `Input` and returns a result of type `Output`.
   *
   * @param {Input} arg The input argument for the function.
   * @returns {Output} The result of the function.
   */
  (arg: Input): Output;

  /**
   * Composes the current function with another function. The output of the
   * current function becomes the input of the next function, creating a new
   * `ComposableFunction`.
   *
   * @template NextOutput The output type of the next function in the
   * composition.
   *
   * @param {(arg: Output) => NextOutput} fn The next function to compose with.
   *
   * @returns {ComposableFunction<Input, NextOutput>} A new composable function
   * combining the current and next function.
   */
  compose<NextOutput>(
    fn: (arg: Output) => NextOutput,
  ): ComposableFunction<Input, NextOutput>;
}
