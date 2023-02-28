function filterArray(arr1, arr2) {
  const map = new Map(arr2.map(item => [item.card_id, item]));
  return arr1.filter(item => map.has(item.card_id));
}

  module.exports = filterArray