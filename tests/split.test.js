const {splitCounts} = require('../src/services/split');

const splits = [{percent: 50}, {percent: 30}, {percent: 20}];

describe('splitCounts', () => {
  it('splits evenly when there is no remainder', () => {
    expect(splitCounts(10, splits)).toEqual([5, 3, 2]);
  });

  it('given the remainder to the biggest fraction', () => {
    expect(splitCounts(7, splits)).toEqual([4, 2, 1]);
  });
});
