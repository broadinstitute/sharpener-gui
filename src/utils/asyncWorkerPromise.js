export function asyncThread(fn, ...args) {
    if (!window.Worker) throw Promise.reject(
        new ReferenceError(`WebWorkers aren't available.`)
    );

    const fnWorker = `
      ;self.onmessage = function(message) {
        ;(${fn.toString()})
          .apply(null, message.data)
          .then(result => self.postMessage(result));
      };`;
    console.log(fnWorker)

    return new Promise((resolve, reject) => {
        try {
            const blob = new Blob([fnWorker], { type: 'text/javascript' });
            const blobUrl = window.URL.createObjectURL(blob);
            const worker = new Worker(blobUrl);
            window.URL.revokeObjectURL(blobUrl);

            worker.onmessage = result => {
                resolve(result.data);
                worker.terminate();
            };

            worker.onerror = error => {
                reject(error);
                worker.terminate();
            };

            worker.postMessage(args);
        } catch (error) {
            reject(error);
        }
    });
}

export function thread(fn, ...args) {
    if (!window.Worker) throw Promise.reject(
        new ReferenceError(`WebWorkers aren't available.`)
    );

    const fnWorker = `
      ;self.onmessage = function(message) {
        ;self.postMessage(
          (${fn.toString()}).apply(null, message.data)
        );
      };`;
    return new Promise((resolve, reject) => {
        try {
            const blob = new Blob([fnWorker], { type: 'text/javascript' });
            const blobUrl = window.URL.createObjectURL(blob);
            const worker = new Worker(blobUrl);
            window.URL.revokeObjectURL(blobUrl);

            worker.onmessage = result => {
                resolve(result.data);
                worker.terminate();
            };

            worker.onerror = error => {
                reject(error);
                worker.terminate();
            };

            worker.postMessage(args);
        } catch (error) {
            reject(error);
        }
    });
}

// example with an async/await function
export const asyncJobToThreads = (async (job, ...data) => {
    try {
        const res1 = await thread(
            job, ...data
        );
        return res1;
    } catch (error) {
        console.log("Worker error!", error);
    }
});
