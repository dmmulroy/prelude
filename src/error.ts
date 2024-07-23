export abstract class TaggedError extends Error {
  abstract _tag: string;
}

export function isTaggedError(error: Error): error is TaggedError {
  if ("_tag" in error) {
    return true;
  }

  return false;
}
