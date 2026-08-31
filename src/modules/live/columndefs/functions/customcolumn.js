const sanitizeNumericValue = (value) => {
    if (typeof value === "string") {
      return parseFloat(
        value.replace(/[%$,]/g, "").trim()
      ) || 0;
    }

    return isNaN(value) ||
      value === undefined ||
      value === null
      ? 0
      : value;
  };

  const computeRPC = (data) => {
    const revenue = sanitizeNumericValue(data.revenue);
    const conversions = sanitizeNumericValue(data.conversions);

    if (conversions > 0) {
      return Number(
        (revenue / conversions).toFixed(2)
      );
    }

    return 0;
  };

  const computeCPCLC = (data) => {
    const fblinkClicks =
      sanitizeNumericValue(data.fblinkclicks);

    const spend =
      sanitizeNumericValue(data.spend);

    if (fblinkClicks > 0) {
      return Number(
        (spend / fblinkClicks).toFixed(2)
      );
    }

    return 0;
  };

  const computeCPL = (data) => {
    const fbleads =
      sanitizeNumericValue(data.fbleads);

    const spend =
      sanitizeNumericValue(data.spend);

    if (fbleads > 0) {
      return Number(
        (spend / fbleads).toFixed(2)
      );
    }

    return 0;
  };

  const computeNCPL = (data) => {
    const conversions =
      sanitizeNumericValue(data.conversions);

    const spend =
      sanitizeNumericValue(data.spend);

    if (conversions > 0) {
      return Number(
        (spend / conversions).toFixed(2)
      );
    }

    return 0;
  };

  const computeMargin = (data) => {
    const revenue =
      sanitizeNumericValue(data.revenue);

    const spend =
      sanitizeNumericValue(data.spend);

    if (revenue > 0) {
      return Number(
        (((revenue - spend) / revenue) * 100).toFixed(2)
      );
    }

    return 0;
  };

  const computeFMargin = (data) => {
    const spend =
      sanitizeNumericValue(data.spend);

    const revenue1 =
      sanitizeNumericValue(data.revenue);

    const fbleads =
      sanitizeNumericValue(data.fbleads);

    const revenue =
      computeRPC(data) * fbleads;

    if (revenue > 0) {
      return Number(
        (((revenue1 - spend) / revenue) * 100).toFixed(2)
      );
    }

    return 0;
  };

  const computeROI = (data) => {
    const revenue =
      sanitizeNumericValue(data.revenue);

    const spend =
      sanitizeNumericValue(data.spend);

    if (spend > 0) {
      return Number(
        (((revenue - spend) / spend) * 100).toFixed(2)
      );
    }

    return 0;
  };

  const computeCTR = (data) => {
    const impressions =
      sanitizeNumericValue(data.impressions);

    const fbclicks =
      sanitizeNumericValue(data.fbclicks);

    if (impressions > 0) {
      return Number(
        ((fbclicks / impressions) * 100).toFixed(2)
      );
    }

    return 0;
  };

  const computeAggregatedRPC = (params) => {
    const totalConversions =
      params.rowNode.allLeafChildren.reduce(
        (acc, child) =>
          acc +
          sanitizeNumericValue(
            child.data.conversions
          ),
        0
      );

    const totalRevenue =
      params.rowNode.allLeafChildren.reduce(
        (acc, child) =>
          acc +
          sanitizeNumericValue(
            child.data.revenue
          ),
        0
      );

    if (totalConversions > 0) {
      return Number(
        (totalRevenue / totalConversions).toFixed(2)
      );
    }

    return 0;
  };


  const computeAggregatedCPCLC = (params) => {
    const totalSpend =
      params.rowNode.allLeafChildren.reduce(
        (acc, child) =>
          acc +
          sanitizeNumericValue(
            child.data.spend
          ),
        0
      );

    const totalFBLinkClicks =
      params.rowNode.allLeafChildren.reduce(
        (acc, child) =>
          acc +
          sanitizeNumericValue(
            child.data.fblinkclicks
          ),
        0
      );

    if (totalFBLinkClicks > 0) {
      return Number(
        (totalSpend / totalFBLinkClicks).toFixed(2)
      );
    }

    return 0;
  };


  const computeAggregatedNCPL = (params) => {
    const totalSpend =
      params.rowNode.allLeafChildren.reduce(
        (acc, child) =>
          acc +
          sanitizeNumericValue(
            child.data.spend
          ),
        0
      );

    const totalConversions =
      params.rowNode.allLeafChildren.reduce(
        (acc, child) =>
          acc +
          sanitizeNumericValue(
            child.data.conversions
          ),
        0
      );

    if (totalConversions > 0) {
      return Number(
        (totalSpend / totalConversions).toFixed(2)
      );
    }

    return 0;
  };


  const computeAggregatedCPL = (params) => {
    const totalSpend =
      params.rowNode.allLeafChildren.reduce(
        (acc, child) =>
          acc +
          sanitizeNumericValue(
            child.data.spend
          ),
        0
      );

    const totalFbleads =
      params.rowNode.allLeafChildren.reduce(
        (acc, child) =>
          acc +
          sanitizeNumericValue(
            child.data.fbleads
          ),
        0
      );

    if (totalFbleads > 0) {
      return Number(
        (totalSpend / totalFbleads).toFixed(2)
      );
    }

    return 0;
  };


  const computeAggregatedMargin = (params) => {
    const totalSpend =
      params.rowNode.allLeafChildren.reduce(
        (acc, child) =>
          acc +
          sanitizeNumericValue(
            child.data.spend
          ),
        0
      );

    const totalRevenue =
      params.rowNode.allLeafChildren.reduce(
        (acc, child) =>
          acc +
          sanitizeNumericValue(
            child.data.revenue
          ),
        0
      );

    if (totalRevenue > 0) {
      return Number(
        (((totalRevenue - totalSpend) / totalRevenue) * 100)
          .toFixed(2)
      );
    }

    return 0;
  };


  const computeAggregatedFMargin = (params) => {
    const totalSpend =
      params.rowNode.allLeafChildren.reduce(
        (acc, child) =>
          acc +
          sanitizeNumericValue(
            child.data.spend
          ),
        0
      );

    const totalRevenue1 =
      params.rowNode.allLeafChildren.reduce(
        (acc, child) =>
          acc +
          sanitizeNumericValue(
            child.data.revenue
          ),
        0
      );

    const totalFbleads =
      params.rowNode.allLeafChildren.reduce(
        (acc, child) =>
          acc +
          sanitizeNumericValue(
            child.data.fbleads
          ),
        0
      );

    const totalRevenue =
      computeAggregatedRPC(params) *
      totalFbleads;

    if (totalRevenue > 0) {
      return Number(
        (((totalRevenue1 - totalSpend) / totalRevenue) * 100)
          .toFixed(2)
      );
    }

    return 0;
  };


  const computeAggregatedROI = (params) => {
    const totalSpend =
      params.rowNode.allLeafChildren.reduce(
        (acc, child) =>
          acc +
          sanitizeNumericValue(
            child.data.spend
          ),
        0
      );

    const totalRevenue =
      params.rowNode.allLeafChildren.reduce(
        (acc, child) =>
          acc +
          sanitizeNumericValue(
            child.data.revenue
          ),
        0
      );

    if (totalSpend > 0) {
      return Number(
        (((totalRevenue - totalSpend) / totalSpend) * 100)
          .toFixed(2)
      );
    }

    return 0;
  };


  const computeAggregatedCTR = (params) => {
    const totalImpressions =
      params.rowNode.allLeafChildren.reduce(
        (acc, child) =>
          acc +
          sanitizeNumericValue(
            child.data.impressions
          ),
        0
      );

    const totalFBClicks =
      params.rowNode.allLeafChildren.reduce(
        (acc, child) =>
          acc +
          sanitizeNumericValue(
            child.data.fbclicks
          ),
        0
      );

    if (totalImpressions > 0) {
      return Number(
        ((totalFBClicks / totalImpressions) * 100)
          .toFixed(2)
      );
    }

    return 0;
  };
  const cpcSpender1 = (params) => {
    let total = 0;
    let count = 0;

    params.values.forEach((value) => {
      const num = parseFloat(value);

      if (!isNaN(num)) {
        total += num;
        count += 1;
      }
    });

    if (count === 0) {
      return 0;
    }

    return Number(total / count);
  };
  const customAggFunc = (params, formula) => {
    if (!params.rowNode.group) {
      return null;
    }

    const aggregatedValues = {};

    const formulaKeys =
      formula.match(/[a-zA-Z_]\w*/g) || [];

    formulaKeys.forEach((key) => {
      const keyLower = key.toLowerCase();

      if (keyLower === "margin") {
        aggregatedValues[keyLower] =
          computeAggregatedMargin(params);

      } else if (keyLower === "fmargin") {
        aggregatedValues[keyLower] =
          computeAggregatedFMargin(params);

      } else if (keyLower === "cpclinkclicks") {
        aggregatedValues[keyLower] =
          computeAggregatedCPCLC(params);

      } else if (keyLower === "rpc") {
        aggregatedValues[keyLower] =
          computeAggregatedRPC(params);

      } else if (keyLower === "cpc") {
        aggregatedValues[keyLower] =
          cpcSpender1(params);

      } else if (keyLower === "cpl") {
        aggregatedValues[keyLower] =
          computeAggregatedCPL(params);

      } else if (keyLower === "ncpl") {
        aggregatedValues[keyLower] =
          computeAggregatedNCPL(params);

      } else if (keyLower === "roi") {
        aggregatedValues[keyLower] =
          computeAggregatedROI(params);

      } else if (keyLower === "ctr") {
        aggregatedValues[keyLower] =
          computeAggregatedCTR(params);

      } else {
        aggregatedValues[keyLower] =
          params.rowNode.allLeafChildren.reduce(
            (acc, child) =>
              acc +
              sanitizeNumericValue(
                child.data[keyLower]
              ),
            0
          );
      }
    });

    try {
      const originalKeys =
        Object.keys(aggregatedValues);

      const sanitizedKeys =
        originalKeys.map(
          key =>
            key.replace(
              /[^a-zA-Z_$0-9]/g,
              "_"
            )
        );

      const keyMapping = {};

      sanitizedKeys.forEach(
        (key, index) => {
          keyMapping[key] =
            originalKeys[index];
        }
      );

      const sanitizedValues =
        sanitizedKeys.map(
          key =>
            aggregatedValues[
            keyMapping[key]
            ]
        );

      const safeFormula =
        formula.replace(
          /\/(\s*)0/g,
          "/(0 === 0 ? 1 : 0)"
        );

      const func =
        new Function(
          ...sanitizedKeys,
          `return ${safeFormula}`
        );

      const result =
        func(...sanitizedValues);

      return (
        isNaN(result) ||
        !isFinite(result)
      )
        ? 0
        : Number(
          result.toFixed(2)
        );

    } catch (error) {
      console.error(
        "Error evaluating aggregated formula:",
        error
      );

      return 0;
    }
  };

  export {sanitizeNumericValue, computeRPC, computeCPCLC, computeCPL, computeNCPL, computeMargin, computeFMargin, computeROI, computeCTR, computeAggregatedRPC, computeAggregatedCPCLC, computeAggregatedNCPL, computeAggregatedCPL, computeAggregatedMargin, computeAggregatedFMargin, computeAggregatedROI,computeAggregatedCTR, cpcSpender1, customAggFunc}