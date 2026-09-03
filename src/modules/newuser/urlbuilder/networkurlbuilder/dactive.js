"use client"
import React, { useEffect } from 'react';
import { message, Row, Col } from 'antd';
import { useState, useRef } from 'react';
import SubmitButton from '@/components/common/submitbutton';
import SearchInput from '@/components/common/searchinput';
import ReusableSelect from '@/components/newuser/select';
const DActiveUrlBuilder = ({ onReturnMessage, showSubmitButton, theme }) => {
  // Initial data array
  const [source, setSource] = useState("None");
  const [channel, setChannel] = useState("0");
  const [geo, setGeo] = useState(''); // AdText input
  const [baseUrl, setBaseUrl] = useState(""); // Base URL input
  const [errorMessage, setErrorMessage] = useState('');
  const [NetworkData, setNetworkData] = useState([]);
  const [generatedUrl, setGeneratedUrl] = useState(""); // To store the generated URL


  const getUrlBuilderData = async () => {
    const network = "DActive";

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
    }
  };

  useEffect(() => {
    getUrlBuilderData();
  }, []);

  // Function to add a new item

  const onClickClear = () => {
    setSource(null);
    setChannel(null);
    setGeo('');
    setBaseUrl("");
    // setKeyWords('');
    setErrorMessage('');
    setGeneratedUrl(""); // Clear the generated URL
  }

  const generateUrl = () => {

    if (baseUrl && geo) {
      // Replace `atxt` placeholder with the provided `geo` value
      let updatedUrl = baseUrl.replace(/atxt=([^&]*)/, `atxt=${geo}`);

      // Check if `tg1` and `tg2` exist in the URL and append `tg3` to `tg6` after `tg2`
      const tg2Regex = /&tg1={tg1}&tg2={tg2}/;
      if (tg2Regex.test(updatedUrl)) {
        const tg3to6 = `&tg3={{ad.id}}&tg4={{adset.name}}&tg5={{campaign.name}}&tg6={{ad.name}}`;
        updatedUrl = updatedUrl.replace(tg2Regex, `&tg1={{adset.id}}&tg2={{campaign.id}}${tg3to6}`);
      }

      // Append `channel` as `ct` only if the channel is not "0"
      if (channel !== null && channel !== "0") {
        updatedUrl += `&ct=${channel}`;
      }

      return updatedUrl;
    }
    return null;
  };


  // console.log(showSubmitButton);

  const onClickSubmit = () => {
    const url = generateUrl();
    if (url) {
      onReturnMessage(url); // Return the URL to the parent
      setErrorMessage(""); // Clear error message
    } else {
      setErrorMessage("Please complete all fields.");
    }
  };


  const onClickGet = () => {
    const url = generateUrl();
    if (url) {
      setGeneratedUrl(url); // Set the generated URL
      setErrorMessage(""); // Clear error message
    } else {
      setErrorMessage("Please complete all fields.");
    }
  };


  const onCopyUrl = () => {
    if (generatedUrl) {
      navigator.clipboard.writeText(generatedUrl).then(() => {
        message.success("URL copied to clipboard!");
      });
    } else {
      message.error("No URL to copy!");
    }
  };

  const onChangeSource = (value) => {
    setSource(value);
    value === "None" && setChannel("0");
  }

  const onChangeChannel = (value) => {
    setChannel(value)
  }

  const onChangeGeo = (event) => {
    setGeo(event.target.value)
  }
  const onChangeKeyword = (event) => {
    setKeyWords(event.target.value)
  }



  return (
    <div style={{ width: '100%' }}>
      <Row style={{ width: '100%' }}>
        <Col span={24}>
          <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>Base URL</label>
          <div style={{ width: '100%' }}>
            <SearchInput
              placeholder="Base URL"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              theme={theme}
              width="100%"
              height={27}
            />
          </div>
        </Col>
      </Row>
      <Row style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '10px', paddingTop: '15px' }}>
        <Col style={{ display: 'flex', flexDirection: 'column' }} span={10}>
          <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>AdText</label>
          <SearchInput
            placeholder="AdText"
            value={geo}
            required
            onChange={(e) => setGeo(e.target.value)}
            theme={theme}
            width="100%"
            height={27}
          />
        </Col>
        <Col style={{ display: 'flex', flexDirection: 'column' }} span={4}>
          <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>Category</label>
          <ReusableSelect
            showSearch
            required
            placeholder={
              <span
                style={{
                  color: theme === "dark" ? "#fff" : "#333",
                }}
              >
                Source
              </span>
            }
            value={source}
            onChange={onChangeSource}
            options={NetworkData?.Source?.map((item) => ({
              value: item.name,
              label: item.name,
            }))}
            width="100%"
            size="small"
            height={27}
            theme={theme}
          />
        </Col>
        <Col style={{ display: 'flex', flexDirection: 'column' }} span={3}>
          <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>CT</label>
          <ReusableSelect
            showSearch
            placeholder={
              <span
                style={{
                  color: theme === "dark" ? "#fff" : "#333",
                }}
              >
                Channel
              </span>
            }
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
          >
          </SubmitButton>
          {!showSubmitButton &&
            <SubmitButton
              onClick={onClickSubmit}
              text="Submit"
            >
            </SubmitButton>}
        </Col>
      </Row>

      {generatedUrl && (
        <Row justify="center" style={{ marginTop: "20px" }}>
          <Col>
            <p style={{ fontWeight: 600, textAlign: "center", width: "100%", fontSize: "16px" }}>
              Generated URL:{" "}
              {/* <a href={generatedUrl} target="_blank" rel="noopener noreferrer">
                {generatedUrl}
              </a> */}
              <span style={{ fontWeight: 600, fontSize: "16px", marginRight: "10px" }}>{generatedUrl}</span>
              <br />
              <SubmitButton
                onClick={onCopyUrl} type="default"
                text="Copy"
              >
              </SubmitButton  >
            </p>
          </Col>
        </Row>
      )}
      <Row justify="center" style={{ marginTop: '10px' }}>
        <Col>
          <p style={{ color: errorMessage === "Please complete all fields." && "red", fontWeight: 600, textAlign: 'center', width: '100%', fontSize: '20px' }}>{errorMessage}</p>
        </Col>
      </Row>
    </div>
  );
};

export default DActiveUrlBuilder;