function groupByAccountNumberAndDate(data, specifiedDateKey, collectionName) {
  return data?.reduce((acc, obj) => {
    const accountKey = obj.accountNumber;
    const dateKey = obj[`${specifiedDateKey}Date`]; // dynamically access the specified date field

    // Create a combined key for grouping by both accountNumber and dynamically passed date field
    const key = `${accountKey}_${dateKey}`;

    // Find if the combined key already exists in the accumulator array
    let entry = acc.find(item => item.key === key);

    if (!entry) {
      // If not found, create a new entry for this accountNumber and specifiedDate
      acc.push({
        key, // Unique key for grouping
        accountNumber: obj.accountNumber,
        specifiedDate: dateKey,
        spend: obj.spend ? parseFloat(obj.spend) : 0,
        estimated_revenue: obj.estimated_revenue ? parseFloat(obj.estimated_revenue) : 0,
        fbClicks: obj.fbClicks ? parseInt(obj.fbClicks) : 0,
        fbLinkClicks: obj.fbLinkClicks ? parseInt(obj.fbLinkClicks) : 0,
        impressions: obj.impressions ? parseInt(obj.impressions) : 0,
        fbLeads: obj.fbLeads ? parseInt(obj.fbLeads) : 0,
        conversions: collectionName.length === 1 && collectionName[0] === "Facebook_Mnet" && time === "UTC"
          ? obj.ad_clicks
            ? parseInt(obj?.ad_clicks)
            : 0
          : obj.conversions
            ? parseInt(obj?.conversions)
            : 0,
        revenuePartner: obj.revenuePartner,
        mediaBuyerName: obj.MediaBuyerName,
        holder: obj.Holder,
        // rpc: parseFloat(((obj.estimated_revenue/obj.conversions)*100)/100).toFixed(2),
        // cpl: parseFloat(((obj.spend/obj.fbLeads)*100)/100).toFixed(2) || 0
      });
    } else {
      // If found, sum the respective fields
      entry.spend += obj.spend !== null && obj.spend !== undefined ? parseFloat(obj.spend) : 0;
      entry.estimated_revenue += obj.estimated_revenue !== null && obj.estimated_revenue !== undefined ? parseFloat(obj.estimated_revenue) : 0;
      entry.fbLeads += obj.fbLeads !== null && obj.fbLeads !== undefined ? parseInt(obj.fbLeads) : 0;
      entry.fbClicks += obj.fbClicks !== null && obj.fbClicks !== undefined ? parseInt(obj.fbClicks) : 0;
      entry.fbLinkClicks += obj.fbLinkClicks !== null && obj.fbLinkClicks !== undefined ? parseInt(obj.fbLinkClicks) : 0;
      entry.impressions += obj.impressions !== null && obj.impressions !== undefined ? parseInt(obj.impressions) : 0;
      entry.conversions += collectionName.length === 1 && collectionName[0] === "Facebook_Mnet" && time === "UTC"
        ? obj?.ad_clicks !== null && obj?.ad_clicks !== undefined
          ? parseInt(obj?.ad_clicks)
          : 0
        : obj?.conversions !== null && obj?.conversions !== undefined
          ? parseInt(obj?.conversions)
          : 0;
    }

    return acc;
  }, []).map(account => {
    // Calculate profit after grouping
    account.profit = account.estimated_revenue - account.spend,
      account.rpc = parseFloat(((account.estimated_revenue / account.conversions) * 100) / 100).toFixed(2),
      account.cpl = parseFloat(((account.spend / account.fbLeads) * 100) / 100).toFixed(2) || 0,
      account.cpc = parseFloat(((account.spend / account.fbClicks) * 100) / 100).toFixed(2) || 0,
      account.ctr = parseFloat((((account.fbClicks / account.impressions) * 100) * 100) / 100).toFixed(2) || 0

    return account;
  });
}
function groupByAccountNumberAndDateDataOfProfitAccounts(data, specifiedDateKey, collectionName) {
  return data
    ?.reduce((acc, obj) => {
      const accountKey = obj.accountNumber;
      const dateKey = obj[`${specifiedDateKey}Date`];
      const key = `${accountKey}_${dateKey}`;

      let entry = acc.find(item => item.key === key);

      if (!entry) {
        acc.push({
          key,
          accountNumber: obj.accountNumber,
          specifiedDate: dateKey,
          spend: obj.spend ? parseFloat(obj.spend) : 0,
          estimated_revenue: obj.estimated_revenue ? parseFloat(obj.estimated_revenue) : 0,
          fbClicks: obj.fbClicks ? parseInt(obj.fbClicks) : 0,
          fbLinkClicks: obj.fbLinkClicks ? parseInt(obj.fbLinkClicks) : 0,
          impressions: obj.impressions ? parseInt(obj.impressions) : 0,
          fbLeads: obj.fbLeads ? parseInt(obj.fbLeads) : 0,
          conversions:
            collectionName.length === 1 &&
              collectionName[0] === "Facebook_Mnet" &&
              time === "UTC"
              ? obj.ad_clicks
                ? parseInt(obj.ad_clicks)
                : 0
              : obj.conversions
                ? parseInt(obj.conversions)
                : 0,
          revenuePartner: obj.revenuePartner,
          mediaBuyerName: obj.MediaBuyerName,
          holder: obj.Holder,
        });
      } else {
        entry.spend += obj.spend != null ? parseFloat(obj.spend) : 0;
        entry.estimated_revenue +=
          obj.estimated_revenue != null ? parseFloat(obj.estimated_revenue) : 0;
        entry.fbLeads += obj.fbLeads != null ? parseInt(obj.fbLeads) : 0;
        entry.fbClicks += obj.fbClicks != null ? parseInt(obj.fbClicks) : 0;
        entry.fbLinkClicks +=
          obj.fbLinkClicks != null ? parseInt(obj.fbLinkClicks) : 0;
        entry.impressions +=
          obj.impressions != null ? parseInt(obj.impressions) : 0;
        entry.conversions +=
          collectionName.length === 1 &&
            collectionName[0] === "Facebook_Mnet" &&
            time === "UTC"
            ? obj.ad_clicks != null
              ? parseInt(obj.ad_clicks)
              : 0
            : obj.conversions != null
              ? parseInt(obj.conversions)
              : 0;
      }

      return acc;
    }, [])
    .map(account => {
      account.profit = account.estimated_revenue - account.spend;
      account.rpc = (
        account.estimated_revenue / account.conversions || 0
      ).toFixed(2);
      account.cpl = (
        account.spend / account.fbLeads || 0
      ).toFixed(2);
      account.cpc = (
        account.spend / account.fbClicks || 0
      ).toFixed(2);
      account.ctr = (
        (account.fbClicks / account.impressions) * 100 || 0
      ).toFixed(2);

      return account;
    })
    .filter(account => account.profit > 0); // Only return profitable accounts
}
function groupByAccountNumberAndDateDataOfLossAccounts(data, specifiedDateKey, collectionName) {
  return data
    ?.reduce((acc, obj) => {
      const accountKey = obj.accountNumber;
      const dateKey = obj[`${specifiedDateKey}Date`];
      const key = `${accountKey}_${dateKey}`;

      let entry = acc.find(item => item.key === key);

      if (!entry) {
        acc.push({
          key,
          accountNumber: obj.accountNumber,
          specifiedDate: dateKey,
          spend: obj.spend ? parseFloat(obj.spend) : 0,
          estimated_revenue: obj.estimated_revenue ? parseFloat(obj.estimated_revenue) : 0,
          fbClicks: obj.fbClicks ? parseInt(obj.fbClicks) : 0,
          fbLinkClicks: obj.fbLinkClicks ? parseInt(obj.fbLinkClicks) : 0,
          impressions: obj.impressions ? parseInt(obj.impressions) : 0,
          fbLeads: obj.fbLeads ? parseInt(obj.fbLeads) : 0,
          conversions:
            collectionName.length === 1 &&
              collectionName[0] === "Facebook_Mnet" &&
              time === "UTC"
              ? obj.ad_clicks
                ? parseInt(obj.ad_clicks)
                : 0
              : obj.conversions
                ? parseInt(obj.conversions)
                : 0,
          revenuePartner: obj.revenuePartner,
          mediaBuyerName: obj.MediaBuyerName,
          holder: obj.Holder,
        });
      } else {
        entry.spend += obj.spend != null ? parseFloat(obj.spend) : 0;
        entry.estimated_revenue +=
          obj.estimated_revenue != null ? parseFloat(obj.estimated_revenue) : 0;
        entry.fbLeads += obj.fbLeads != null ? parseInt(obj.fbLeads) : 0;
        entry.fbClicks += obj.fbClicks != null ? parseInt(obj.fbClicks) : 0;
        entry.fbLinkClicks +=
          obj.fbLinkClicks != null ? parseInt(obj.fbLinkClicks) : 0;
        entry.impressions +=
          obj.impressions != null ? parseInt(obj.impressions) : 0;
        entry.conversions +=
          collectionName.length === 1 &&
            collectionName[0] === "Facebook_Mnet" &&
            time === "UTC"
            ? obj.ad_clicks != null
              ? parseInt(obj.ad_clicks)
              : 0
            : obj.conversions != null
              ? parseInt(obj.conversions)
              : 0;
      }

      return acc;
    }, [])
    .map(account => {
      account.profit = account.estimated_revenue - account.spend;
      account.rpc = (
        account.estimated_revenue / account.conversions || 0
      ).toFixed(2);
      account.cpl = (
        account.spend / account.fbLeads || 0
      ).toFixed(2);
      account.cpc = (
        account.spend / account.fbClicks || 0
      ).toFixed(2);
      account.ctr = (
        (account.fbClicks / account.impressions) * 100 || 0
      ).toFixed(2);

      return account;
    })
    .filter(account => account.profit < 0); // Only return profitable accounts
}

// Top 5 by Spend
function groupByAccountNumber(data, specifiedDateKey, collectionName) {
  return data?.reduce((acc, obj) => {
    const accountKey = obj.accountNumber;
    const dateKey = obj[`${specifiedDateKey}Date`];
    const key = `${accountKey}_${dateKey}`;

    let entry = acc.find(item => item.key === key);

    if (!entry) {
      entry = {
        key,
        accountNumber: accountKey,
        specifiedDate: dateKey,
        spend: Number(obj.spend) || 0,
        estimated_revenue: Number(obj.estimated_revenue) || 0,
        fbLeads: Number(obj.fbLeads) || 0,
        conversions: Number(obj.conversions) || 0,
        revenuePartner: obj.revenuePartner,
        mediaBuyerName: obj.MediaBuyerName,
        holder: obj.Holder,
      };

      acc.push(entry);
    } else {
      entry.spend += Number(obj.spend) || 0;
      entry.estimated_revenue += Number(obj.estimated_revenue) || 0;
      entry.fbLeads += Number(obj.fbLeads) || 0;
      entry.conversions += Number(obj.conversions) || 0;
    }

    return acc;
  }, []).map(entry => ({
    ...entry,
    profit: entry.estimated_revenue - entry.spend,
  }));
}
function getTop5BySpend(data, specifiedDateKey, collectionName) {
  return groupByAccountNumber(data, specifiedDateKey, collectionName)
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 5);
}

// Top 5 by Revenue
function getTop5ByRevenue(data, specifiedDateKey, collectionName) {
  return groupByAccountNumber(data, specifiedDateKey, collectionName)
    .sort((a, b) => b.estimated_revenue - a.estimated_revenue)
    .slice(0, 5);
}

// Top 5 by Profit
function getTop5ByProfit(data, specifiedDateKey, collectionName) {
  return groupByAccountNumber(data, specifiedDateKey, collectionName)
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 5);
}
function groupByCampaignAndDate(data, time, collectionName) {
  return data?.reduce((acc, obj) => {
    const campaignKey = obj?.campaign_id;
    const dateKey = obj[`${time}Date`]; // directly access the specifiedDate field from the object
    const accountNumber = obj?.accountNumber;
    // Create a combined key for grouping by both campaign_name and specifiedDate
    const key = `${campaignKey}_${dateKey}_${accountNumber}`;

    // Find if the combined key already exists in the accumulator array
    let entry = acc.find(item => item.key === key);

    if (!entry) {
      // If not found, create a new entry for this campaign_name and specifiedDate
      acc.push({
        key, // Unique key for grouping
        campaign_name: obj?.campaign_name,
        campaign_id: obj?.campaign_id,
        Date: dateKey,
        spend: obj.spend ? parseFloat(obj.spend) : 0,
        estimated_revenue: obj?.estimated_revenue ? parseFloat(obj?.estimated_revenue) : 0,
        fbLeads: obj.fbLeads ? parseInt(obj?.fbLeads) : 0,
        fbClicks: obj.fbClicks ? parseInt(obj?.fbClicks) : 0,
        fbLinkClicks: obj.fbLinkClicks ? parseInt(obj?.fbLinkClicks) : 0,
        impressions: obj.impressions ? parseInt(obj?.impressions) : 0,
        conversions: collectionName.length === 1 && collectionName[0] === "Facebook_Mnet" && time === "UTC"
          ? obj.ad_clicks
            ? parseInt(obj?.ad_clicks)
            : 0
          : obj.conversions
            ? parseInt(obj?.conversions)
            : 0,
        revenuePartner: obj?.revenuePartner,
        mediaBuyerName: obj?.MediaBuyerName,
        holder: obj?.Holder,
        accountNumber: obj?.accountNumber
        // Add any other fields you want to keep after grouping
      });
    } else {
      // If found, sum the respective fields
      entry.spend += obj?.spend !== null && obj?.spend !== undefined ? parseFloat(obj?.spend) : 0;
      entry.estimated_revenue += obj?.estimated_revenue !== null && obj?.estimated_revenue !== undefined ? parseFloat(obj?.estimated_revenue) : 0;
      entry.fbLeads += obj?.fbLeads !== null && obj?.fbLeads !== undefined ? parseInt(obj?.fbLeads) : 0;
      entry.fbClicks += obj?.fbClicks !== null && obj?.fbClicks !== undefined ? parseInt(obj?.fbClicks) : 0;
      entry.fbLinkClicks += obj?.fbLinkClicks !== null && obj?.fbLinkClicks !== undefined ? parseInt(obj?.fbLinkClicks) : 0;
      entry.impressions += obj?.impressions !== null && obj?.impressions !== undefined ? parseInt(obj?.impressions) : 0;
      entry.conversions += collectionName.length === 1 && collectionName[0] === "Facebook_Mnet" && time === "UTC"
        ? obj?.ad_clicks !== null && obj?.ad_clicks !== undefined
          ? parseInt(obj?.ad_clicks)
          : 0
        : obj?.conversions !== null && obj?.conversions !== undefined
          ? parseInt(obj?.conversions)
          : 0;
    }

    return acc;
  }, []).map(campaign => {
    // Calculate profit after grouping
    campaign.profit = campaign.estimated_revenue - campaign.spend;
    return campaign;
  });
}
const getCampaignsByDate = (data, time, collectionName, { sortBy, top = 0, filter }) => {
  const grouped = groupByCampaignAndDate(data, time, collectionName).reduce((acc, item) => {
    (acc[item.Date] ??= []).push(item);
    return acc;
  }, {});

  return Object.values(grouped).flatMap(campaigns => {
    let result = filter ? campaigns.filter(filter) : campaigns;

    if (sortBy) {
      result = result.sort((a, b) => b[sortBy] - a[sortBy]);
    }

    return top ? result.slice(0, top) : result;
  });
};
const getTopFiveSpendCampaignsByDate = (data, time, collectionName) =>
  getCampaignsByDate(data, time, collectionName, { sortBy: "spend", top: 5 });

const getTopFiveRevenueCampaignsByDate = (data, time, collectionName) =>
  getCampaignsByDate(data, time, collectionName, { sortBy: "estimated_revenue", top: 5 });

const getTopFiveProfitCampaignsByDate = (data, time, collectionName) =>
  getCampaignsByDate(data, time, collectionName, { sortBy: "profit", top: 5 });

const getAllProfitableCampaignsByDate = (data, time, collectionName) =>
  getCampaignsByDate(data, time, collectionName, {
    sortBy: "profit",
    filter: c => c.profit > 0,
  });

const getAllUnprofitableCampaignsByDate = (data, time, collectionName) =>
  getCampaignsByDate(data, time, collectionName, {
    sortBy: "profit",
    filter: c => c.profit < 0,
  });

function groupDataByDomainAndAccount(data, dateField) {
  // console.log(dateField);
  const DomainGroupedData = data?.reduce((acc, obj) => {
    const { domain, accountNumber, spend, estimated_revenue, ...rest } = obj;
    const specifiedDate = obj[`${dateField}Date`]; // Dynamically get the date based on the field

    // Create a unique key for grouping by domain, specifiedDate, and accountNumber
    const key = `${specifiedDate}-${domain}-${accountNumber}`;

    if (!acc[key]) {
      acc[key] = {
        specifiedDate,
        domain,
        accountNumber,
        spend: 0,
        estimated_revenue: 0,
        fbLeads: 0,
        conversions: 0,
        fbClicks: 0,
        fbLinkClicks: 0, //new
        impressions: 0, // new
        revenuePartner: obj.revenuePartner,
        mediaBuyerName: obj.MediaBuyerName,
        holder: obj.Holder,
      };
    }

    // Sum the fields (spend, estimated_revenue) based on the new grouping
    acc[key].spend += spend;
    acc[key].estimated_revenue += estimated_revenue;
    acc[key].fbLeads += obj.fbLeads !== null && obj.fbLeads !== undefined ? parseInt(obj.fbLeads) : 0;
    acc[key].conversions += obj.conversions !== null && obj.conversions !== undefined ? parseInt(obj.conversions) : 0;
    acc[key].fbClicks += obj.fbClicks ? parseInt(obj.fbClicks) : 0;
    acc[key].fbLinkClicks += obj.fbLinkClicks ? parseInt(obj.fbLinkClicks) : 0; // new
    acc[key].impressions += obj.impressions ? parseInt(obj.impressions) : 0; // new

    return acc;
  }, {});

  // Convert the grouped data object back to an array and add the profit field
  const domainResult = Object.values(DomainGroupedData).map(item => {
    item.profit = item.estimated_revenue - item.spend; // Calculate profit
    return item;
  });

  return domainResult;
}

export {groupByAccountNumberAndDate,groupByAccountNumberAndDateDataOfProfitAccounts,groupByAccountNumberAndDateDataOfLossAccounts, groupByAccountNumber, getTop5BySpend, getTop5ByRevenue, getTop5ByProfit, groupByCampaignAndDate, getCampaignsByDate, getTopFiveSpendCampaignsByDate, getTopFiveRevenueCampaignsByDate, getTopFiveProfitCampaignsByDate, getAllProfitableCampaignsByDate, getAllUnprofitableCampaignsByDate, groupDataByDomainAndAccount};