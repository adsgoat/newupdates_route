"use client"
import React, { useEffect } from 'react';
import { Row, Col } from 'antd';
import { useState, useRef } from 'react';
import SubmitButton from '@/components/common/submitbutton';
import SearchInput from '@/components/common/searchinput';


const System1UrlBuilder = ({ defaultValues, indexValueForAccount, onReturnMessage, showSubmitButton, theme }) => {
  const [siteName, setSiteName] = useState('');
  const [pixelId, setPixelId] = useState('');
  const [keywords, setKeyWords] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [NetworkData, setNetworkData] = useState([]);



  const MnetDomains = [
    {
      "id": 1,
      "name": "POCKETFACTS",
      "code": "PF",
      "account": "MN",
      "url": "https://top.pocketfacts.co/search/850/keywords_replace/?chanel_replace&chnm=business_code_replace_source_code_replace_region_code_replace&chnm2=campaign_id_replace&chnm3=adset_id_replace&trkfb=859792251778708"
    },
    {
      "id": 2,
      "name": "MOTORDIGEST",
      "code": "MD",
      "account": "MN",
      "url": "https://top.motordigest.co/search/850/keywords_replace/?chanel_replace&chnm=business_code_replace_source_code_replace_region_code_replace&chnm2=campaign_id_replace&chnm3=adset_id_replace&trkfb=566855625308747"
    },
    {
      "id": 3,
      "name": "KNOW THE BUZZ",
      "code": "KB",
      "account": "MN",
      "url": "https://top.knowthebuzz.co/search/850/keywords_replace/?chanel_replace&chnm=business_code_replace_source_code_replace_region_code_replace&chnm2=campaign_id_replace&chnm3=adset_id_replace&trkfb=859792251778708"
    },
    {
      "id": 4,
      "name": "Look Up Trends",
      "code": "LT",
      "account": "MN",
      "url": "https://top.lookuptrends.co/search/850/keywords_replace/?chanel_replace&chnm=business_code_replace_source_code_replace_region_code_replace&chnm2=campaign_id_replace&chnm3=adset_id_replace&trkfb=859792251778708"
    },
    {
      "id": 5,
      "name": "ALLCARGUIDE",
      "code": "AG",
      "account": "MN",
      "url": "https://search.allcarguide.co/search/850/keywords_replace/?chanel_replace&chnm=business_code_replace_source_code_replace_region_code_replace&chnm2=campaign_id_replace&chnm3=adset_id_replace&trkfb=566855625308747"
    },
    {
      "id": 6,
      "name": "GENIUSSEARCHES",
      "code": "SG",
      "account": "MN",
      "url": "https://top.geniussearches.net/search/850/keywords_replace/?chanel_replace&chnm=business_code_replace_source_code_replace_region_code_replace&chnm2=campaign_id_replace&chnm3=adset_id_replace&trkfb=859792251778708"
    },
    {
      "id": 7,
      "name": "DAILYEZINE",
      "code": "DZ",
      "account": "MN",
      "url": "https://top.dailyezine.net/search/556/keywords_replace/?chanel_replace&chnm=business_code_replace_source_code_replace_region_code_replace&chnm2=campaign_id_replace&chnm3=adset_id_replace&trkfb=859792251778708"
    },
    {
      "id": 8,
      "name": "READERARCHIVE",
      "code": "RA",
      "account": "MN",
      "url": "https://top.readerarchive.co/search/556/keywords_replace/?chanel_replace&chnm=business_code_replace_source_code_replace_region_code_replace&chnm2=campaign_id_replace&chnm3=adset_id_replace&trkfb=859792251778708"
    }
  ];
  const businessData = [
    {
      "id": 5,
      "name": "System 1",
      "code": "b7",
      "account": "S1",
      "url": "sitename_replace/?ref=facebook&fbid=pixelid_replace&fbclickid={click_id}&fbland=Lead&rskey=keywords_replace&sub_id={{campaign.id}}&sub_id1={{adset.id}}"

    }
  ]
  const Source = [
    {
      "id": 1,
      "name": "facebook",
      "code": "FB",
      "campaignId": "{{campaign.id}}",
      "AdsetId": "{{adset.id}}"
    },
    {
      "id": 2,
      "name": "Taboola",
      "code": "TB",
      "campaignId": "{{campaign.id}}",
      "AdsetId": "{{adset.id}}"
    }
  ];

  const channels = [
    {
      "id": 1,
      "name": "T1",
      "source": "FB",
      "value": "t=1"
    },
    {
      "id": 2,
      "name": "T2",
      "source": "FB",
      "value": "t=2"
    },
    {
      "id": 3,
      "name": "T3",
      "source": "FB",
      "value": "t=3"
    },
    {
      "id": 4,
      "name": "T4",
      "source": "FB",
      "value": "t=4"
    },
    {
      "id": 5,
      "name": "T2",
      "source": "TB",
      "value": "t=2"
    },
    {
      "id": 6,
      "name": "T3",
      "source": "TB",
      "value": "t=3"
    },
    {
      "id": 7,
      "name": "T4",
      "source": "TB",
      "value": "t=4"
    },
    {
      "id": 8,
      "name": "T5",
      "source": "TB",
      "value": "t=5"
    },
    {
      "id": 9,
      "name": "T6",
      "source": "TB",
      "value": "t=6"
    },
    {
      "id": 10,
      "name": "T7",
      "source": "TB",
      "value": "t=7"
    },
    {
      "id": 11,
      "name": "T8",
      "source": "TB",
      "value": "t=8"
    },
    {
      "id": 12,
      "name": "T9",
      "source": "TB",
      "value": "t=9"
    },
    {
      "id": 13,
      "name": "T10",
      "source": "TB",
      "value": "t=10"
    }
  ];



  const getUrlBuilderData = async () => {
    const network = "System1";

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
        const defaultSiteName = indexValueForAccount?.split("/")[0];
        const defaultPixelID = indexValueForAccount?.split("/")[1]?.split("&")[2]?.split("=")[1];
        const defaultKeyword = indexValueForAccount?.split("/")[1]?.split("&")[5]?.split("=")[1];
        setSiteName(defaultSiteName);
        setPixelId(defaultPixelID);
        setKeyWords(defaultKeyword);
      }
      else {
        if (defaultValues) {
          const defaultSiteName = defaultValues?.split("/")[0];
          const defaultPixelID = defaultValues?.split("/")[1]?.split("&")[2]?.split("=")[1];
          // const defaultKeyword = defaultValues?.split("/")[1]?.split("&")[5]?.split("=")[1];
          setSiteName(defaultSiteName);
          setPixelId(defaultPixelID);
          setKeyWords("");
        }
      }
    }
  };

  useEffect(() => {
    getUrlBuilderData();
  }, []);

  const onChangeSiteName = (event) => {
    setSiteName(event.target.value);
  }

  const onChangePixelId = (event) => {
    setPixelId(event.target.value)
  }

  const onChangeKeyword = (event) => {
    setKeyWords(event.target.value)
  }

  const onClickClear = () => {
    setSiteName('');
    setPixelId('');
    setKeyWords('');
    setErrorMessage('');
  }

  const onClickSubmit = () => {

    if (keywords && pixelId && siteName) {
      let url = NetworkData?.businessData[0]?.url;

      url = url
        .replace("sitename_replace", siteName.trim())
        .replace("pixelid_replace", pixelId.trim())
        .replace("keywords_replace", keywords.trim());
      onReturnMessage(url);
    }
    else {
      setErrorMessage("Please complete all fields.");
    }
  }

  const onClickGet = () => {

    if (keywords && pixelId && siteName) {
      let url = NetworkData?.businessData[0]?.url;

      url = url
        .replace("sitename_replace", siteName.trim())
        .replace("pixelid_replace", pixelId.trim())
        .replace("keywords_replace", keywords.trim());
      setErrorMessage(url);
    }
    else {
      setErrorMessage("Please complete all fields.");
    }
  }

  return (
    <div style={{ width: '100%' }}>
      <Row style={{ display: 'flex', alignItems: 'center', paddingBottom: '10px',gap:"20px" }}>
        <Col style={{ display: 'flex', flexDirection: 'column' }} span={9}>
          <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>Site Name</label>
          <SearchInput
            placeholder='Site Name'
            value={siteName}
            required
            onChange={onChangeSiteName}
            theme={theme}
            width="100%"
            height={27}
          ></SearchInput>
        </Col>

        <Col style={{ display: 'flex', flexDirection: 'column' }} span={5}>
          <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>Pixel ID</label>
          <SearchInput
            placeholder='Pixel'
            value={pixelId}
            required
            onChange={onChangePixelId}
            theme={theme}
            width="100%"
            height={27}
          ></SearchInput>
        </Col>
      </Row>
      <Row style={{ width: '100%' }}>
        <Col span={24}>
          <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>Keywords</label>
          <div style={{ width: '100%' }}>
            <SearchInput
              placeholder="Key words"
              value={keywords}
              onChange={onChangeKeyword}
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
              text="Submit"
              onClick={onClickSubmit}
            >
            </SubmitButton>}
        </Col>
      </Row>
      <Row justify="center" style={{ marginTop: '10px' }}>
        <Col>
          <p style={{ color: errorMessage === "Please complete all fields." && "red", fontWeight: 600, textAlign: 'center', width: '100%', fontSize: '20px' }}>{errorMessage}</p>
        </Col>
      </Row>
      {/* <button onClick={addItem}>Add Item</button> */}
    </div>
  );
};

export default System1UrlBuilder;