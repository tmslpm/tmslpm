export const responseIsJSON = (r: Response) => {
  let contentType = r.headers.get("content-type");
  return (contentType && contentType.indexOf("application/json") !== -1)
}

export async function fetchJSON<T>(endpoint: string): Promise<T> {
  const r = await fetch(endpoint);
  if (!r.ok)
    throw new Error("no response received");
  if (!responseIsJSON(r))
    throw new Error("bad content-type");
  return r.json();
}

export async function asyncFetchJSON<T>(endpoint: string): Promise<T> {
  return fetch(endpoint).then(response => {
    if (!response.ok) throw new Error("no response received");
    if (!responseIsJSON(response)) throw new Error("bad content-type");
    return response.json();
  })
}

export function batchPromise<T, CB>(data: T[], process: (v: T) => Promise<CB>, enProcess: (v: CB[]) => void): void {
  let batchResults: CB[] = [];
  let i = 0;
  const batchProcess = async () => {
    let batchPromises: Promise<CB>[] = [], currentMaxIteration = i + 25;
    while (i < currentMaxIteration && i < data.length)
      batchPromises.push(process(data[i++])
        .then(r => {
          batchResults.push(r)
          return r;
        })
      );

    Promise.all(batchPromises).then((b) => {
      if (i < data.length)
        batchProcess();
      else
        enProcess(batchResults);
    });
  };
  batchProcess();
}
