# `patchService` API Documentation

A lightweight runtime monkey-patching framework for services with centralized patch tracking, fix documentation, and service instance discovery.

## Example: Application Studio Wizard Fix

```javascript
patchService({
  patchName: "lateLocaleEventReplayPatch",
  serviceName: "EpEventService",
  methodName: "broadcast",

  fixDescription:
    "Fixes Application Studio New button wizard not showing the application selector. The wizard subscribes after EP_EVENT_LOCALE_LOADED has already been broadcast, causing registration to be missed. This patch replays EP_EVENT_LOCALE_LOADED so late subscribers initialize correctly.",

  once(instance) {
    setTimeout(() => {
      instance.broadcast("EP_EVENT_LOCALE_LOADED");

      console.log(
        "Application Studio New button wizard fix applied"
      );
    }, 0);
  }
});
```

## Registry Structure

```javascript
window.patchRegistry = {
  fixes: {},

  lateLocaleEventReplayPatch: {
    patchName: "lateLocaleEventReplayPatch",
    serviceName: "EpEventService",
    methodName: "broadcast",
    original: Function,
    before: undefined,
    after: undefined,
    once: Function,
    override: undefined,
    instance: EpEventService,
    installedAt: "2026-07-26T20:44:00.000Z"
  },

  get(name),
  list()
};
```

## Runtime Inspection

```javascript
patchRegistry.list();
```

```javascript
patchRegistry.lateLocaleEventReplayPatch;
```

```javascript
patchRegistry.lateLocaleEventReplayPatch.instance;
```

```javascript
patchRegistry.fixes.lateLocaleEventReplayPatch;
```

## Logging Example

```javascript
patchService({
  patchName: "eventLogger",

  serviceName: "EpEventService",

  methodName: "broadcast",

  before(instance, args) {
    console.log(
      "Broadcasting:",
      args[0]
    );
  after(instance, args) {
    console.log(
      "Broadcasted:",
      args[0]
    );
  }
});
```

## Override Example

```javascript
patchService({
  patchName: "eventFilter",

  serviceName: "EpEventService",

  methodName: "broadcast",

  override(original, instance, args) {
    if (args[0] === "UNWANTED_EVENT") {
      return;
    }

    return original(...args);
  }
});
```