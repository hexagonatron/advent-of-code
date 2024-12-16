
interface PriorityQueueEntry<T> {
    priority: number;
    item: T;
}

export class PriorityQueue<T> {
    private queue: PriorityQueueEntry<T>[];
    length: number;

    constructor() {
        this.queue = [];
        this.length = 0;
    }

    push(priority: number, item: T) {
        const indexToInsert = this.queue.findIndex((existingItem) => existingItem.priority >= priority);
        if (indexToInsert === -1) {
            this.queue.push({priority, item});
        } else {
            this.queue.splice(indexToInsert, 0, {item, priority});
        }
        this.length++;
    }

    pop(): T | undefined {
        const dequeuedItem = this.queue.shift();
        if (dequeuedItem === undefined) {
            return undefined;
        }
        this.length--;
        return dequeuedItem.item;
    }

    map<U>(callback: (v: T, i: number) => U): U[] {
        return this.queue.map((value, i) => {
            return callback(value.item, i);
        });
    }
}