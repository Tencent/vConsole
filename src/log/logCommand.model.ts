const identifierList = ['.', '[', ']', '(', ')', '{', '}'];

export const getLastIdentifier = (text: string) => {
  // for case 'aa.bb.cc'
  const ret = {
    text: '',        // '.'
    pos: -1,         // 5
    before: '',      // 'aa.bb'
    after: '',       // 'cc'
  };
  for (let i = text.length - 1; i >= 0; i--) {
    const idx = identifierList.indexOf(text[i]);
    if (idx > -1) {
      ret.text = identifierList[idx];
      ret.pos = i;
      ret.before = text.substring(0, i);
      ret.after = text.substring(i + 1, text.length);
      break;
    }
  }
  return ret;
};
