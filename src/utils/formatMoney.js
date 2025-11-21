export const formatMoney = (val) => {
  if (val === undefined || val === null || isNaN(val)) return '$0';
  return '$' + Math.floor(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};
