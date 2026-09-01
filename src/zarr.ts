import * as zarr from 'zarrita';

/** Opens a Dolphin displacement cube from an HTTP-accessible Zarr v2/v3 store. */
export async function openDolphinCube(url: string) {
  const store = new zarr.FetchStore(url.replace(/\/$/, ''));
  const array = await zarr.open(store, { kind: 'array' });
  if (array.shape.length !== 3) {
    throw new Error(`Expected a [time, y, x] displacement cube, received ${array.shape.length} dimensions.`);
  }
  return {
    array,
    shape: array.shape as [number, number, number],
    attributes: array.attrs as Record<string, unknown>,
    /** Reads one acquisition without downloading the rest of the time series. */
    readDate: (index: number) => zarr.get(array, [index, null, null]),
  };
}
