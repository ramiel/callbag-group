/* eslint-env jest */

const group = require('./index.js');
const range = require('callbag-range');

describe('Listenable source', () => {
  const spySink = jest.fn();

  const sourceFactory = n => (t, d) => {
    if (t === 0) {
      d(0, () => {});
      for (let i = 0; i < n; i += 1) {
        d(1, i);
      }
      d(2);
    }
  };

  const sink = (t, d) => {
    if (t === 1) {
      spySink(d);
    }
  };

  beforeEach(() => {
    spySink.mockClear();
  });

  test('gives a chunk', () => {
    const source = sourceFactory(5);
    const groupedSource = group(5)(source);
    groupedSource(0, sink);
    expect(spySink).toHaveBeenCalledTimes(1);
    expect(spySink).toHaveBeenLastCalledWith(expect.any(Array));
  });

  test('the chunk contains n elements', () => {
    const source = sourceFactory(5);
    const groupedSource = group(5)(source);
    let chunk;
    groupedSource(0, (t, d) => {
      if (t === 1) {
        chunk = d;
      }
    });
    expect(chunk).toHaveLength(5);
  });

  test('the chunk contains n elements (no rest)', () => {
    const source = sourceFactory(50);
    const groupedSource = group(5)(source);
    const chunks = [];
    groupedSource(0, (t, d) => {
      if (t === 1) {
        chunks.push(d);
      }
    });
    expect(chunks).toHaveLength(10);
    for (let i = 0; i < chunks; i += 1) {
      expect(chunks[i]).toHaveLength(5);
    }
  });

  test('produce "data mod n" chunks (rest = 0)', () => {
    const source = sourceFactory(10);
    const groupedSource = group(5)(source);
    groupedSource(0, sink);
    expect(spySink).toHaveBeenCalledTimes(2);
  });

  test('produce "data mod n" chunks (rest != 0)', () => {
    const source = sourceFactory(21);
    const groupedSource = group(5)(source);
    groupedSource(0, sink);
    expect(spySink).toHaveBeenCalledTimes(5);
  });

  test('last chunk can contain less then n data', () => {
    const source = sourceFactory(21);
    const groupedSource = group(5)(source);
    let chunk;
    groupedSource(0, (t, d) => {
      if (t === 1) {
        chunk = d;
      }
    });
    expect(chunk).toHaveLength(1);
  });
});

describe('Pullable source', () => {
  const spySink = jest.fn();

  const sourceFactory = n => (start, sink) => {
    if (start !== 0) return;
    let i = 0;
    sink(0, (t) => {
      if (t === 1) {
        sink(1, i);
        i += 1;
        if (i === n) {
          i = 0;
          sink(2);
        }
      }
    });
  };

  const sinkFactory = n => (t, d) => {
    if (t === 0) {
      for (let i = 0; i < n; i += 1) {
        d(1);
      }
    }
    if (t === 1) {
      spySink(d);
    }
  };

  beforeEach(() => {
    spySink.mockClear();
  });

  test('gives a chunk', () => {
    const source = sourceFactory(5);
    const sink = sinkFactory(5);
    const groupedSource = group(5)(source);
    groupedSource(0, sink);
    // source(0, sink);
    expect(spySink).toHaveBeenCalledTimes(1);
    expect(spySink).toHaveBeenLastCalledWith(expect.any(Array));
  });

  test('the chunk contains n elements', () => {
    const source = sourceFactory(5);
    const groupedSource = group(5)(source);
    let chunk;
    groupedSource(0, (t, d) => {
      if (t === 0) {
        for (let i = 0; i < 5; i += 1) {
          d(1);
        }
      }
      if (t === 1) {
        chunk = d;
      }
    });
    expect(chunk).toHaveLength(5);
  });

  test('the chunk contains n elements (no rest)', () => {
    const source = sourceFactory(50);
    const groupedSource = group(5)(source);
    const chunks = [];
    groupedSource(0, (t, d) => {
      if (t === 0) {
        for (let i = 0; i < 50; i += 1) {
          d(1);
        }
      }
      if (t === 1) {
        chunks.push(d);
      }
    });
    expect(chunks).toHaveLength(10);
    for (let i = 0; i < chunks; i += 1) {
      expect(chunks[i]).toHaveLength(5);
    }
  });

  test('produce "data mod n" chunks (rest = 0)', () => {
    const source = sourceFactory(10);
    const groupedSource = group(5)(source);
    const sink = sinkFactory(10);
    groupedSource(0, sink);
    expect(spySink).toHaveBeenCalledTimes(2);
  });

  test('produce "data mod n" chunks (rest != 0)', () => {
    const source = sourceFactory(21);
    const groupedSource = group(5)(source);
    const sink = sinkFactory(21);
    groupedSource(0, sink);
    expect(spySink).toHaveBeenCalledTimes(5);
  });

  test('last chunk can contain less then n data', () => {
    const source = sourceFactory(21);
    const groupedSource = group(5)(source);
    let chunk;
    groupedSource(0, (t, d) => {
      if (t === 0) {
        for (let i = 0; i < 21; i += 1) {
          d(1);
        }
      }
      if (t === 1) {
        chunk = d;
      }
    });
    expect(chunk).toHaveLength(1);
  });
});


describe('Interoperating', () => {
  const spySink = jest.fn();
  const sink = (t, d) => {
    if (t === 0) {
      d(1);
    } else if (t === 1) {
      spySink(d);
    }
  };

  beforeEach(() => {
    spySink.mockClear();
  });
  test('a little tests with community modules', () => {
    const source = range(1, 10);
    const groupedSource = group(5)(source);
    groupedSource(0, sink);
    expect(spySink).toHaveBeenCalledTimes(2);
    expect(spySink).toHaveBeenLastCalledWith(expect.any(Array));
  });
});
