const splitCounts = (total, splits) => {
  const shares = splits.map((split) => (total * split.percent) / 100);
  const counts = shares.map((share) => Math.floor(share));

  let given = 0;
  for (const count of counts) {
    given = given + count;
  }
  let left = total - given;

  const order = shares
    .map((share, index) => ({index, rest: share - Math.floor(share)}))
    .sort((a, b) => b.rest - a.rest);

  for (const item of order) {
    if (left === 0) break;
    counts[item.index] = counts[item.index] + 1;
    left = left - 1;
  }

  return counts;
};

module.exports = {splitCounts};
