export const sleepForMilliseconds = (milliseconds: number) => new Promise<void>((resolve) => {
    setTimeout(() => {
        resolve();
    }, milliseconds);
})