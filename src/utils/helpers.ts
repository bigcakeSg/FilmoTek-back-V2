export const normalizeTitle = (title) => {
  return (
    title
      .toLowerCase()
      // Le La Les Un Une Des L' D'
      .replace(/^(the |a |an |le |la |l'|les |un |une |d'|des |el |los |las |una |il |i |der |das |die |ein )/i, '')
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
      .replace(/\W/g, '')
      .replace(/\s/g, '')
  );
};
