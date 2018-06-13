const group = n => source => (start, sink) => {
  if (start !== 0) return;
  let talkback;
  const chunk = [];
  source(0, (t, d) => {
    if (t === 0) {
      talkback = d;
    }
    if (t === 1) {
      chunk.push(d);
      if (chunk.length === n) {
        sink(t, chunk.splice(0));
      }
      talkback(1);
    } else {
      if (t === 2 && chunk.length) {
        sink(1, chunk.splice(0));
      }
      sink(t, d);
    }
  });
};

module.exports = group;
