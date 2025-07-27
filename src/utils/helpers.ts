export const normalizeTitle = (title) => {
  return title
    .replace(/^(The |A |An |Le |La |L'|Les |Un |Une |D'|Des )/i, '')
    .toLowerCase()
    .replace(/\s/g, '')
    .replace(/[àáâãäå]/g, 'a')
    .replace(/æ/g, 'ae')
    .replace(/ç/g, 'c')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/ñ/g, 'n')
    .replace(/[òóôõö]/g, 'o')
    .replace(/œ/g, 'oe')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ýÿ]/g, 'y')
    .replace(/\W/g, '');
};
