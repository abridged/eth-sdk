import { TType } from './types';

export function parseType(mainType: TType): {
  type: TType;
  bytes: number;
} {
  let type: TType = null;
  let bytes: number = null;

  if (
    mainType.startsWith('bytes')
  ) {
    bytes = parseInt(mainType.replace('bytes', ''), 10);
    type = 'bytes';
  } else if (
    mainType.startsWith('uint')
  ) {
    bytes = parseInt(mainType.replace('uint', ''), 10) / 8;
    type = 'uint';
  }

  return {
    type,
    bytes,
  };
}
