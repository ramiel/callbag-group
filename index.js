const group = n => source => (start, sink) => {
  let bunch = [];
  if (start !== 0) return;
  source(0, (t, d) => {
    if (t === 0) {
      sink(0, d);
    } else if (t === 1) {
      bunch.push(d);
      if (bunch.length === n) {
        sink(1, bunch);
        bunch = [];
      }
    } else if (t === 2) {
      if (bunch.length) {
        sink(1, bunch);
      }
      sink(t, d);
    }
  });
};

module.exports = group;
