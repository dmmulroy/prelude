export abstract class TaggedError extends Error {
  abstract _tag: string;
}

export function isTaggedError(error: Error): error is TaggedError {
  if (error instanceof TaggedError) {
    return true;
  }

  return false;
}
