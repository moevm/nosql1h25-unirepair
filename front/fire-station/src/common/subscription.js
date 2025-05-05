import query from "./query.js";

class Subscription {
  constructor(name, param, timeout, callback) {
    console.log(
      `New subscription: ${name} with timeout ${timeout}, param ${param}`,
    );
    this.param = param;
    this.timeout = timeout;
    this.name = name;
    this.callback = async () => {
      if (!this.callback) return;
      const result = await query("subscribe_" + this.name, {
        action: "request",
        param: this.param,
        timeout: this.timeout,
      });
      this.id = result.id;
      if (result.hasUpdates) await callback(result.data);
      setTimeout(this.callback.bind(this), this.timeout);
    };
    this.callback();
  }

  async unsubscribe() {
    console.log(`Unsubscribing from ${this.name}, id ${this.id}`);
    this.callback = null;
    await query("subscribe_" + this.name, {
      action: "unsubscribe",
      id: this.id,
      param: this.param,
    });
  }
}

function subscribe(name, param, timeout, callback) {
  return new Subscription(name, param, timeout, callback);
}

export default subscribe;
