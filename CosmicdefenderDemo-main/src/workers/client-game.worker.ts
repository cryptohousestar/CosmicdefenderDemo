export type WorkerIn =
	| { type: "input"; payload: any }
	| { type: "resize"; payload: { w: number; h: number; dpr: number } }
	| { type: "settings"; payload: any };

export type WorkerOut =
	| { type: "ack"; payload?: any }
	| { type: "renderState"; payload: any }
	| { type: "hudEvents"; payload: any };

self.onmessage = (e: MessageEvent<WorkerIn>) => {
	switch (e.data.type) {
		case "input": {
			(self as any).postMessage({ type: "ack", payload: { received: "input" } } as WorkerOut);
			break;
		}
		case "resize": {
			(self as any).postMessage({ type: "ack", payload: { received: "resize", size: e.data.payload } } as WorkerOut);
			break;
		}
		case "settings": {
			(self as any).postMessage({ type: "ack", payload: { received: "settings" } } as WorkerOut);
			break;
		}
		default: {
			(self as any).postMessage({ type: "ack", payload: { received: "unknown" } } as WorkerOut);
		}
	}
};

