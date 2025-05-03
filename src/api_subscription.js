import * as assert from "./assert.js";

class SubscriptionHandler {
  constructor(param, updater) {
    assert.assertFunction(updater);
    this.updater = updater;
    this.nextId = 1;
    this.data = {};
    this.subscribers = [];
    this.param = param;
  }

  removeExpired() {
    const now = Date.now();
    this.subscribers = this.subscribers.filter(
      (s) => now - s.lastRequestAt < s.timeout,
    );
  }

  async update() {
    this.removeExpired();
    this.data = {};
    for (let s of this.subscribers) {
      this.data[s.param] = await this.updater(s.param);
      s.hasUpdates = true;
    }
  }

  route(name) {
    assert.assertString(name);
    return {
      ["subscribe_" +
      name +
      "/action:string id:uint?=0 timeout:uint?=10000 param:" +
      this.param]: async ({ action, id, timeout, param }) => {
        action = action.value;
        id = id.value;
        timeout = timeout.value;
        assert.assertOneOf(action, ["request", "unsubscribe"]);
        switch (action) {
          case "request":
            let subscriber;
            if (id === 0) {
              id = this.nextId++;
              this.subscribers.push({
                id,
                lastRequestAt: Date.now(),
                timeout,
                hasUpdates: true,
                param,
              });
              subscriber = this.subscribers.find((s) => s.id === id);
            } else {
              subscriber = this.subscribers.find((s) => s.id === id);
              if (!subscriber) {
                this.subscribers.push({
                  id,
                  lastRequestAt: Date.now(),
                  timeout,
                  hasUpdates: true,
                  param,
                });
                subscriber = this.subscribers.find((s) => s.id === id);
              } else {
                subscriber.lastRequestAt = Date.now();
                subscriber.timeout = timeout;
              }
            }
            const p = subscriber.param;
            if (this.data[p] === undefined)
              this.data[p] = await this.updater(p);
            const hasUpdates = subscriber.hasUpdates;
            subscriber.hasUpdates = false;
            return {
              id,
              hasUpdates,
              data: hasUpdates ? this.data[p] : null,
            };
          case "unsubscribe":
            this.subscribers = this.subscribers.filter((s) => s.id !== id);
            break;
        }
      },
    };
  }
}

export function subscription(param, updater) {
  return new SubscriptionHandler(param, updater);
}
