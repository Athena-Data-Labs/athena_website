function readPackageHook(pkg) {
  // Approve builds for @swc/core and esbuild so they compile in CI
  if (pkg.name === '@swc/core' || pkg.name === 'esbuild') {
    pkg.allowBuild = true;
  }
  return pkg;
}

module.exports = {
  hooks: {
    readPackage: readPackageHook,
  },
};
