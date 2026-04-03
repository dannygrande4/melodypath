// Allow build scripts for Prisma and esbuild
function readPackage(pkg) {
  return pkg
}

module.exports = {
  hooks: {
    readPackage,
  },
}
