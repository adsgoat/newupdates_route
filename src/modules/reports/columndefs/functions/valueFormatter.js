const currencyFormatter = (params) => {
    return `$${parseFloat(params.value || 0).toFixed(2)}`; // Ensure 2 decimal places in currency format
};
export { currencyFormatter };