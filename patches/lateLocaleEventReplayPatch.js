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