export function isEmpty(value: any): boolean {
  return (
    value === null ||
    value === undefined ||
    Number.isNaN(value)
  );
}

export function toRaw(object: any): any {
  return JSON.parse(JSON.stringify(object));
}

export function cleanEmpty(object: any): any {
  object = object as { [key: string]: any };

  for (const key in object) {
    if (isEmpty(object[key])) {
      delete object[key];
    }
  }

  return object;
}

export function sleep(ms: number): Promise<void> {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}
