module.exports = async () => {
  await globalThis.dbContainer.stop();
};
