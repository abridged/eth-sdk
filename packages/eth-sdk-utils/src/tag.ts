export function isTag(tag: any): boolean {
  let result = false;

  switch (tag) {
    case 'latest':
    case 'earliest':
    case 'pending':
      result = true;
      break;
  }

  return result;
}
