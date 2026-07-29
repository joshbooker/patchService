window.patchRegistry ??= {
  fixes: {},

  get(name) {
    return this[name];
  },

  list() {
    return Object.keys(this).filter(name =>
      !["fixes", "get", "list", "unpatch"].includes(name)
    );
  },

  unpatch(name) {
    const patch = this[name];

    if (!patch) {
      return false;
    }

    patch.prototype[patch.methodName] =
      patch.original;

    delete this[name];
    delete this.fixes[name];

    console.log(`unpatched ${name}`);

    return true;
  }
};

function patchService({
  patchName,
  serviceName,
  methodName,
  before,
  after,
  once,
  override,
  fixDescription
}) {
  let req;

  window.webpackChunkhomepage.push([["__patch_service__"],{},r => {req = r;}]);

  if (!req?.m) {
    console.error("webpack require not found");
    return false;
  }

  for (const id of Object.keys(req.m)) {
    let exp;

    try {
      exp = req(id);
    }
    catch {
      continue;
    }

    if (!exp || (typeof exp !== "object" && typeof exp !== "function")) {
      continue;
    }

    for (const key in exp) {
      let C;

      try {
        C = exp[key];
      }
      catch {
        continue;
      }

      if (!C?.prototype?.getDefaultModel) {
        continue;
      }

      const P = C.prototype;

      if (typeof P[methodName] !== "function") {
        continue;
      }

      let objectName = "";

      try {
        objectName = ((P.getDefaultModel.call({}) || {}).objectName) || "";
      }
      catch {}

      if (objectName !== serviceName) {
        continue;
      }

      const original = P[methodName];
      let onceRan = false;

      window.patchRegistry[patchName] = {
        patchName,
        serviceName,
        methodName,
        prototype: P,
        original,
        before,
        after,
        once,
        override,
        instance: null,
        enabled: true,
        installedAt: new Date().toISOString()
      };

      if (fixDescription) {
        window.patchRegistry.fixes[patchName] = {
          description: fixDescription
        };
      }

      P[methodName] = function (...args) {
        const patch = window.patchRegistry[patchName];

        if (!patch) {
          return original.apply(this, args);
        }

        if (!patch.enabled) {
          return original.apply(this, args);
        }

        if (!onceRan) {
          onceRan = true;

          patch.instance = this;

          try {
            patch.once?.call(this, this, args);
          }
          catch (e) {
            console.error(
              `[${patchName}] once hook failed`,
              e
            );
          }
        }

        try {
          patch.before?.call(this, this, args);
        }
        catch (e) {
          console.error(
            `[${patchName}] before hook failed`,
            e
          );
        }

        const result = typeof patch.override === "function"
          ? patch.override.call(
              this,
              original.bind(this),
              this,
              args
            )
          : original.apply(this, args);

        try {
          patch.after?.call(this, this, args, result);
        }
        catch (e) {
          console.error(
            `[${patchName}] after hook failed`,
            e
          );
        }

        return result;
      };

      console.log(
        `patched ${serviceName}.${methodName} (${patchName})`
      );

      return true;
    }
  }

  console.error(`${serviceName} not found`);

  return false;
}