"use client"
import React, { useEffect } from 'react';
import { Row, Col } from 'antd';
import { useState, useRef } from 'react';
import ReusableSelect from '@/components/newuser/select';
import SubmitButton from '@/components/common/submitbutton';
import SearchInput from '@/components/common/searchinput';

const MnetBingUrlBuilder = ({ defaultValues, indexValueForAccount, onReturnMessage, showSubmitButton, accountis, theme }) => {
  // Initial data array
  const [domain, setDomain] = useState(null);
  const [source, setSource] = useState("FB");
  const [channel, setChannel] = useState("None");
  const [memberId, setMembetId] = useState('');
  const [geo, setGeo] = useState('');
  const [keywords, setKeyWords] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [NetworkData, setNetworkData] = useState([]);

  const [copyText, setCopyText] = useState('Copy');
  const [pixelId, setPixelId] = useState('PixelId');
  const pixelIds = ['PixelId', 'None'];




  const getUrlBuilderData = async () => {
    // const response = await apiClient.get(`/get/urlbuilderdata?network=MnetBing`);
    const network = "MnetBing";

    const response = await fetch(
      `/api/newuser/urlbuilderdata?network=${encodeURIComponent(network)}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    const json = await response.json();
    if (response?.status === 200) {
      setNetworkData(json)
      if (indexValueForAccount) {
        // console.log(defaultValues);
        // console.log(defaultValues.split("//")[1].split("/")[0]);
        const DomainUrls = json?.Domains
          .filter(item => item.url.includes(indexValueForAccount?.split("//")[1]?.split("/")[0]))
          .map(item => item.url);
        // console.log(DomainUrls);
        setDomain(DomainUrls[0]);

        const text = indexValueForAccount?.split("//")[1]?.split("/")[3];
        const result = text.replace(/\+/g, " ");
        // console.log(result);
        setKeyWords(result);
        // console.log(indexValueForAccount.split("//")[1]?.split("/")[4]?.split("&")[0]?.split("?")[1]);
        setChannel(indexValueForAccount.split("//")[1]?.split("/")[4]?.split("&")[0]?.split("?")[1]);
        setMembetId(indexValueForAccount?.split("//")[1]?.split("/")[4]?.split("&")[1]?.split("=")[1]?.split("_")[0]);
        setSource(indexValueForAccount?.split("//")[1]?.split("/")[4]?.split("&")[1]?.split("=")[1]?.split("_")[1]);
        setGeo(indexValueForAccount?.split("//")[1]?.split("/")[4]?.split("&")[1]?.split("=")[1]?.split("_")[2]);
        setSource("FB");
        if (indexValueForAccount.includes('&trkfb')) { setPixelId('PixelId') } else { setPixelId('None') };
        // console.log(indexValueForAccount.split("//")[1].split("/")[0]);
        // const domainData = response 
      } else {
        if (defaultValues) {
          // console.log(defaultValues);
          // console.log(defaultValues.split("//")[1].split("/")[0]);
          const DomainUrls = json?.Domains
            .filter(item => item.url.includes(defaultValues?.split("//")[1]?.split("/")[0]))
            .map(item => item.url);
          // console.log(DomainUrls);
          setDomain(DomainUrls[0]);

          const text = defaultValues?.split("//")[1]?.split("/")[3];
          const result = text.replace(/\+/g, " ");
          // console.log(result);
          setKeyWords("");
          // console.log(defaultValues.split("//")[1]?.split("/")[4]?.split("&")[0]?.split("?")[1]);
          setChannel(defaultValues.split("//")[1]?.split("/")[4]?.split("&")[0]?.split("?")[1]);
          setMembetId(defaultValues?.split("//")[1]?.split("/")[4]?.split("&")[1]?.split("=")[1]?.split("_")[0]);
          setSource(defaultValues?.split("//")[1]?.split("/")[4]?.split("&")[1]?.split("=")[1]?.split("_")[1]);
          setGeo(defaultValues?.split("//")[1]?.split("/")[4]?.split("&")[1]?.split("=")[1]?.split("_")[2]);
          setSource("FB");
          if (defaultValues.includes('&trkfb')) { setPixelId('PixelId') } else { setPixelId('None') };
          // console.log(defaultValues.split("//")[1].split("/")[0]);
          // const domainData = response 
        }
      }
    }
  };

  useEffect(() => {
    setDomain(null)
    setSource("FB");
    setChannel("None");
    setGeo('');
    setMembetId('');
    setKeyWords('');
    setErrorMessage('');
    setPixelId('PixelId');
  }, [accountis]);

  useEffect(() => {
    getUrlBuilderData();
  }, []);

  const onChangePixelId = (value) => {
    setPixelId(value);
  }

  // Function to add a new item

  const onClickClear = () => {
    setDomain(null)
    setSource("FB");
    setChannel("None");
    setGeo('');
    setMembetId('');
    setKeyWords('');
    setErrorMessage('');
    setPixelId('PixelId');
  }
  // console.log(showSubmitButton);

  const onClickSubmit = () => {

    if (keywords && channel && domain && source && pixelId) {
      // const formattedKeywords = keywords.replace(/\s+/g, '+'); praveen 
      const formattedKeywords = keywords.trimEnd().replace(/\s+/g, '+'); //s

      const campaign_id = NetworkData?.Source?.find(item => item.code === source).campaignId;
      const adset_id = NetworkData?.Source?.find(item => item.code === source).AdsetId;
      const ad_id = NetworkData?.Source?.find(item => item.code === source).AdId;
      let url;

      if (pixelId === 'PixelId') {
        url = domain;
      }
      else {
        const newDomain = domain.split("&trkfb");
        url = newDomain[0];
      }

      if (channel === "None") {
        url = url
          .replace("keywords_replace", formattedKeywords)
          .replace("&chanel_replace", "")
          .replace("business_code_replace_source_code_replace_region_code_replace", campaign_id)
          .replace("campaign_id_replace", adset_id)
          .replace("adset_id_replace", ad_id);
      }
      else {

        url = url
          .replace("keywords_replace", formattedKeywords)
          .replace("chanel_replace", channel)
          .replace("business_code_replace_source_code_replace_region_code_replace", campaign_id)
          .replace("campaign_id_replace", adset_id)
          .replace("adset_id_replace", ad_id);
      }
      onReturnMessage(url);
    }
    else {
      setErrorMessage("Please complete all fields.");
    }
  }

  const onClickGet = () => {

    if (keywords && channel && domain && source && pixelId) {
      const formattedKeywords = keywords.trimEnd().replace(/\s+/g, '+');
      const campaign_id = NetworkData?.Source?.find(item => item.code === source).campaignId;
      const adset_id = NetworkData?.Source?.find(item => item.code === source).AdsetId;
      const ad_id = NetworkData?.Source?.find(item => item.code === source).AdId;
      let url;

      if (pixelId === 'PixelId') {
        url = domain;
      }
      else {
        const newDomain = domain.split("&trkfb");
        url = newDomain[0];
      }
      if (channel === "None") {
        url = url
          .replace("keywords_replace", formattedKeywords)
          .replace("&chanel_replace", "")
          .replace("business_code_replace_source_code_replace_region_code_replace", campaign_id)
          .replace("campaign_id_replace", adset_id)
          .replace("adset_id_replace", ad_id);
      }
      else {

        url = url
          .replace("keywords_replace", formattedKeywords)
          .replace("chanel_replace", channel)
          .replace("business_code_replace_source_code_replace_region_code_replace", campaign_id)
          .replace("campaign_id_replace", adset_id)
          .replace("adset_id_replace", ad_id);
      }
      setErrorMessage(url);
    }
    else {
      setErrorMessage("Please complete all fields.");
    }
  }

  const onChangeDomian = (value) => {
    setDomain(value)
  }

  const onChangeSource = (value) => {
    setSource(value);
  }

  const onChangeChannel = (value) => {
    setChannel(value)
  }

  const onChangeMemberId = (event) => {
    setMembetId(event.target.value)
  }

  const onChangeGeo = (event) => {
    setGeo(event.target.value)
  }
  const onChangeKeyword = (event) => {
    setKeyWords(event.target.value)
  }

  return (
    <div style={{ width: '100%' }}>
      <Row style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '10px' }}>
        <Col style={{ display: 'flex', flexDirection: 'column' }} span={6}>
          <label><span style={{ color: 'red', margin: '2px' }}>*</span>Domain</label>
          <ReusableSelect
            showSearch
            required
            placeholder="Select Domain"
            value={domain}
            onChange={onChangeDomian}
            options={NetworkData?.Domains?.map((item) => ({
              value: item.url,
              label: item.name,
            }))}
            width="100%"
            size="small"
            height={27}
            theme={theme}
          />
        </Col>
        <Col style={{ display: 'flex', flexDirection: 'column' }} span={4}>
          <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>Source</label>
          <ReusableSelect
            showSearch
            required
            placeholder="Source"
            value={source}
            onChange={onChangeSource}
            options={NetworkData?.Source?.map((item) => ({
              value: item.code,
              label: item.name,
            }))}
            width="100%"
            size="small"
            height={27}
            theme={theme}

          />
        </Col>
        <Col style={{ display: 'flex', flexDirection: 'column' }} span={3}>
          <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>Channels</label>
          <ReusableSelect
            showSearch
            placeholder="Channel"
            value={channel}
            required
            onChange={onChangeChannel}
            options={NetworkData?.channels
              ?.filter((item) => item.source === source)
              ?.map((item) => ({
                value: item.value,
                label: item.name,
              }))}
            width="100%"
            size="small"
            height={27}
            theme={theme}
          />
        </Col>
        <Col style={{ display: 'flex', flexDirection: 'column', marginBottom: '5px' }} xs={11} sm={5} lg={4}>
          <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>PixelId</label>
          <ReusableSelect
            showSearch
            placeholder="pixelId"
            value={pixelId}
            required
            onChange={onChangePixelId}
            options={pixelIds.map((item) => ({
              label: item,
              value: item
            }))}
            width="100%"
            size="small"
            height={27}
            theme={theme}

          />
        </Col>

      </Row>
      <Row style={{ width: '100%' }}>
        <Col span={24}>
          <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>Keywords</label>
          <div style={{ width: '100%' }}>
            <SearchInput
              placeholder="Keywords"
              value={keywords} onChange={onChangeKeyword}
              theme={theme}
              width="100%"
              height={27}
            />
          </div>
        </Col>
      </Row>

      <Row justify="space-between" style={{ marginTop: '20px' }}>
        <Col>
          <SubmitButton
            type="default"
            onClick={onClickClear}
            text="Clear"
          ></SubmitButton>
        </Col>
        <Col>
          <SubmitButton
            onClick={onClickGet}
            text="Get"
          ></SubmitButton>
          {!showSubmitButton &&
            <SubmitButton
              onClick={onClickSubmit}
              text="Submit"
            ></SubmitButton>}
        </Col>
      </Row>
      <Row justify="center" style={{ marginTop: '10px' }}>
        <Col>
          <p style={{ color: errorMessage === "Please complete all fields." && "red", fontWeight: 600, textAlign: 'center', width: '100%', fontSize: '20px' }}>{errorMessage}</p>
        </Col>
      </Row>
    </div>
  );
};

export default MnetBingUrlBuilder;