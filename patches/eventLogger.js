patchService({
  patchName: "eventLogger",

  serviceName: "EpEventService",

  methodName: "broadcast",

  before(instance, args) {
    console.log(
      "Broadcasting:",
      args[0]
    );
  },
  after(instance, args) {
    console.log(
      "Broadcasted:",
      args[0]
    );
  }
});