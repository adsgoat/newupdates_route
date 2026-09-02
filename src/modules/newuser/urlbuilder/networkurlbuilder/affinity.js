"use client"
import React, { useEffect } from 'react';
import { Row, Col } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { useState, useRef } from 'react';
import SubmitButton from '@/components/common/submitbutton';
import ReusableTooltip from '@/components/newuser/tooltip';
import ReusableSelect from '@/components/newuser/select';
import SearchInput from '@/components/common/searchinput';
const AffinityUrlBuilder = ({ defaultValues, indexValueForAccount, onReturnMessage, showSubmitButton, accountis, primaryText, theme,
    headline,
    description, campaign_name }) => {
    // Initial data array
    const [domain, setDomain] = useState(null);
    const [source, setSource] = useState("fb");
    const [channel, setChannel] = useState("1675913170");
    const [memberId, setMembetId] = useState('');
    const [geo, setGeo] = useState('');
    const [keywords, setKeyWords] = useState('');
    const [channel_id, setChannel_id] = useState('');
    const [rac, setRac] = useState('');
    const [terms, setTerms] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [NetworkData, setNetworkData] = useState([]);
    const [copyText, setCopyText] = useState('Copy');
    const [pixelId, setPixelId] = useState('PixelId');
    const [tmp, setTmp] = useState('9');
    const [tmpIds, setTmpIds] = useState([]);
    const pixelIds = ['PixelId', 'None'];
    const [domainExtension, setDomainExtension] = useState('');
    const [copyMessage, setCopyMessage] = useState('Click to copy');
    const combinedRac =
        [primaryText, headline, description]
            .filter(Boolean)
            .join(",");
    const DataToSend = "domain_extension_replace?src=src_replace&pxi=835172915206585&channel=channel_replace&terms=terms_replace&rac=rac_replace&utm_campaign=utm_campaign_replace&sltId=sltId_replace&tmp=tmp_replace";
    const getUrlBuilderData = async () => {
        const network = "Affinity";
        const response = await fetch(
            `/api/newuser/urlbuilderdata?network=${encodeURIComponent(network)}`,
            {
                method: "GET",
                cache: "no-store",
            }
        );
        const json = await response.json();
        if (response?.status === 200) {
            setTmpIds(json?.tmps.map(item => ({
                label: item.name,
                value: item.value
            })) || []);
            setNetworkData(json)
            if (indexValueForAccount) {

                const domainValue = indexValueForAccount.split("?")[0];
                const tmpValue = new URL(indexValueForAccount).searchParams.get("tmp");
                const sltIdValue = new URL(indexValueForAccount).searchParams.get("sltId");
                const channelValue = new URL(indexValueForAccount).searchParams.get("channel");
                const utm_campaignValue = new URL(indexValueForAccount).searchParams.get("utm_campaign");
                const racValue = new URL(indexValueForAccount).searchParams.get("rac");
                const termsValue = new URL(indexValueForAccount).searchParams.get("terms");
                const pixelValue = new URL(indexValueForAccount).searchParams.get("pxi");
                setTerms(termsValue ? termsValue.replace(/%20/g, " ") : "");
                setKeyWords(utm_campaignValue ? utm_campaignValue.trim().replace(/%20/g, " ") : "");
                setDomainExtension(domainValue);
                setRac(
                    racValue
                        ? decodeURIComponent(racValue).replace(/\+/g, " ")
                        : ""
                );
                setTmp(tmpValue || '9');
                setChannel(sltIdValue || "1675913170");
                setChannel_id(channelValue || '');
                setPixelId(pixelValue ? 'PixelId' : 'None');
                setSource("fb");
            } else {
                if (defaultValues) {
                    console.log(defaultValues);
                    const domainValue = defaultValues.split("?")[0];
                    const tmpValue = new URL(defaultValues).searchParams.get("tmp");
                    const sltIdValue = new URL(defaultValues).searchParams.get("sltId");
                    const channelValue = new URL(defaultValues).searchParams.get("channel");
                    const utm_campaignValue = new URL(defaultValues).searchParams.get("utm_campaign");
                    const racValue = new URL(defaultValues).searchParams.get("rac");
                    const termsValue = new URL(defaultValues).searchParams.get("terms");
                    const pixelValue = new URL(defaultValues).searchParams.get("pxi");
                    setTerms(termsValue ? termsValue.replace(/%20/g, " ") : "");
                    setKeyWords(utm_campaignValue ? utm_campaignValue.trim().replace(/%20/g, " ") : "");
                    setDomainExtension(domainValue);
                    setRac(
                        racValue
                            ? decodeURIComponent(racValue).replace(/\+/g, " ")
                            : ""
                    );
                    setTmp(tmpValue || '9');
                    setChannel(sltIdValue || "1675913170");
                    setChannel_id(channelValue || '');
                    setPixelId(pixelValue ? 'PixelId' : 'None');
                    setSource("fb");
                }
            }
        }

    };

    useEffect(() => {
        setDomain(null)
        setSource("fb");
        setChannel("1675913170");
        setGeo('');
        setMembetId('');
        setKeyWords('');
        setErrorMessage('');
        setPixelId('PixelId');
    }, [accountis]);

    useEffect(() => {
        if (!combinedRac) return;
        setRac(combinedRac);
    }, [combinedRac]);
    useEffect(() => {
        if (!campaign_name) return;
        setKeyWords(campaign_name);
    }, [campaign_name]);

    useEffect(() => {
        getUrlBuilderData();
    }, []);
    useEffect(() => {
        if (channel === "1675913170") {
            setTmp("10");
        } else {
            setTmp("9");
        }
    }, [channel]);

    const onChangePixelId = (value) => {
        setPixelId(value);
    }

    const onChangeTmpId = (value) => {
        setTmp(value);
    }

    // Function to add a new item

    const onClickClear = () => {
        setDomain(null)
        setSource("fb");
        setChannel("1675913170");
        setGeo('');
        setMembetId('');
        setKeyWords('');
        setErrorMessage('');
        setPixelId('PixelId');
        setChannel_id('');
        setRac('');
        setTerms('');
        setTmp('9');
        setDomainExtension('');
    }
    // console.log(showSubmitButton);

    const onClickSubmit = () => {

        if (keywords && channel && domainExtension && source && pixelId && channel_id && rac) {
            // const formattedKeywords = keywords.replace(/\s+/g, '+'); praveen 
            const formattedKeywords = encodeURIComponent(keywords.trim()); //s

            const campaign_id = NetworkData?.Source?.find(item => item.code === source).campaignId;
            const adset_id = NetworkData?.Source?.find(item => item.code === source).AdsetId;
            const ad_id = NetworkData?.Source?.find(item => item.code === source).AdId;
            let url;


            const racValue = rac
                ? rac
                    .split(",")
                    .map(item =>
                        encodeURIComponent(item.trim()).replace(/%20/g, '+')
                    )
                    .join(",")
                : "";

            if (pixelId === 'PixelId') {
                url = DataToSend;
            }
            else {
                // const newDomain = domain.split("&trkfb");
                url = DataToSend.replace("&pxi=835172915206585", "");
            }
            if (channel === "None") {
                url = url
                    .replace("utm_campaign_replace", formattedKeywords)
                    .replace("&chanel_replace", "")
                    .replace("business_code_replace_source_code_replace_region_code_replace", campaign_id)
                    .replace("campaign_id_replace", adset_id)
                    .replace("adset_id_replace", ad_id)
                    .replace("src_replace", source)
                    .replace("channel_replace", channel_id)
                    .replace("rac_replace", racValue)
                    .replace("tmp_replace", tmp);
            }
            else {

                url = url
                    .replace("utm_campaign_replace", formattedKeywords)
                    .replace("sltId_replace", channel)
                    .replace("business_code_replace_source_code_replace_region_code_replace", campaign_id)
                    .replace("campaign_id_replace", adset_id)
                    .replace("adset_id_replace", ad_id)
                    .replace("src_replace", source)
                    .replace("channel_replace", channel_id)
                    .replace("rac_replace", racValue)
                    .replace("tmp_replace", tmp);
            }
            if (terms) {
                url = url.replace("terms_replace", terms.trim().replace(/\s+/g, '%20'));
            } else {
                url = url.replace("&terms=terms_replace", "");
            }
            url = url.replace("domain_extension_replace", domainExtension.trim());

            onReturnMessage(url);
            setErrorMessage(url);
        }
        else {
            setErrorMessage("Please complete all required fields.");
        }
    }

    const onClickGet = () => {

        if (keywords && channel && domainExtension && source && pixelId && channel_id && rac) {
            const formattedKeywords = encodeURIComponent(keywords.trim());
            const campaign_id = NetworkData?.Source?.find(item => item.code === source).campaignId;
            const adset_id = NetworkData?.Source?.find(item => item.code === source).AdsetId;
            const ad_id = NetworkData?.Source?.find(item => item.code === source).AdId;
            let url;
            // const racValue = rac ? rac.trim().replace(/\s+/g, '+') : '';
            // const racValue = rac
            //     ? rac
            //         .split(",")
            //         .map(item => encodeURIComponent(item.trim()))
            //         .join(",")
            //     : "";
            const racValue = rac
                ? rac
                    .split(",")
                    .map(item =>
                        encodeURIComponent(item.trim()).replace(/%20/g, '+')
                    )
                    .join(",")
                : "";

            if (pixelId === 'PixelId') {
                url = DataToSend;
            }
            else {
                // const newDomain = domain.split("&trkfb");
                url = DataToSend.replace("&pxi=835172915206585", "");
            }
            if (channel === "None") {
                url = url
                    .replace("utm_campaign_replace", formattedKeywords)
                    .replace("&chanel_replace", "")
                    .replace("business_code_replace_source_code_replace_region_code_replace", campaign_id)
                    .replace("campaign_id_replace", adset_id)
                    .replace("adset_id_replace", ad_id)
                    .replace("src_replace", source)
                    .replace("channel_replace", channel_id)
                    .replace("rac_replace", racValue)
                    .replace("tmp_replace", tmp);
            }
            else {

                url = url
                    .replace("utm_campaign_replace", formattedKeywords)
                    .replace("sltId_replace", channel)
                    .replace("business_code_replace_source_code_replace_region_code_replace", campaign_id)
                    .replace("campaign_id_replace", adset_id)
                    .replace("adset_id_replace", ad_id)
                    .replace("src_replace", source)
                    .replace("channel_replace", channel_id)
                    .replace("rac_replace", racValue)
                    .replace("tmp_replace", tmp);
            }
            if (terms) {
                url = url.replace("terms_replace", terms.trim().replace(/\s+/g, '%20'));
            } else {
                url = url.replace("&terms=terms_replace", "");
            }
            url = url.replace("domain_extension_replace", domainExtension.trim());
            setErrorMessage(url);
        }
        else {
            setErrorMessage("Please complete all required fields.");
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

    const onChangeRac = (event) => {
        setRac(event.target.value)
    }

    const onChangeTerms = (event) => {
        setTerms(event.target.value)
    }

    const onChangeChannel_id = (event) => {
        setChannel_id(event.target.value)
    }

    const onChangeDomainExtension = (event) => {
        setDomainExtension(event.target.value)
    }

    const onClicktoCopyUrl = () => {
        navigator.clipboard.writeText(errorMessage);
        setCopyMessage('Copied!');
        setTimeout(() => {
            setCopyMessage("Click to copy");
        }, 5000);
    }

    return (
        <div style={{ width: '100%' }}>

            <Row
                style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    paddingBottom: '10px',
                    margin: '0 -5px',
                }}
            >
                {/* Source */}
                <Col
                    span={4}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '0 5px',
                    }}
                >
                    <label>
                        <span style={{ color: 'red' }}>*</span> Source
                    </label>

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
                        theme={theme}
                        width="100%"
                        size="small"
                        height={27}
                    />
                </Col>

                {/* Sltid */}
                <Col
                    span={5}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '0 5px',
                    }}
                >
                    <label>
                        <span style={{ color: 'red' }}>*</span> Sltid
                    </label>

                    <ReusableSelect
                        showSearch
                        placeholder="sltid"
                        value={channel}
                        required
                        theme={theme}
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
                    />
                </Col>

                {/* PixelId */}
                <Col
                    span={4}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '0 5px',
                    }}
                >
                    <label>
                        <span style={{ color: 'red' }}>*</span> PixelId
                    </label>

                    <ReusableSelect
                        showSearch
                        placeholder="pixelId"
                        value={pixelId}
                        required
                        onChange={onChangePixelId}
                        options={pixelIds.map((item) => ({
                            label: item,
                            value: item,
                        }))}
                        theme={theme}
                        width="100%"
                        size="small"
                        height={27}
                    />
                </Col>

                {/* Tmp */}
                <Col
                    span={4}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '0 5px',
                    }}
                >
                    <label>
                        <span style={{ color: 'red' }}>*</span> Tmp
                    </label>

                    <ReusableSelect
                        showSearch
                        placeholder="tmp"
                        value={tmp}
                        required
                        onChange={onChangeTmpId}
                        options={tmpIds}
                        theme={theme}
                        width="100%"
                        size="small"
                        height={27}
                    />
                </Col>

                {/* Channel */}
                <Col
                    span={7}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '0 5px',
                    }}
                >
                    <label>
                        <span style={{ color: 'red' }}>*</span> Channel
                    </label>

                    <SearchInput
                        placeholder="channel"
                        value={channel_id}
                        onChange={onChangeChannel_id}
                        theme={theme}
                        width="100%"
                        height={27}
                    />
                </Col>
            </Row>
            <Row style={{ width: '100%', display: 'flex', justifyContent: "space-between" }}>
                <Col span={12}>
                    <label>
                        <span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>Article</label>
                    <div style={{ width: '100%' }}>
                        <SearchInput
                            placeholder="article"
                            value={domainExtension} onChange={onChangeDomainExtension}
                            theme={theme}
                            width="100%"
                            height={27}
                        />
                    </div>
                </Col>
                <Col span={11}>
                    <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>Utm_campaign</label>
                    <div style={{ width: '100%' }}>
                        <SearchInput
                            placeholder="utm_campaign"
                            value={keywords} onChange={onChangeKeyword}
                            theme={theme}
                            width="100%"
                            height={27}
                        />
                    </div>
                </Col>
            </Row>
            <Row style={{ width: '100%', display: 'flex', justifyContent: "space-between", marginTop: '10px' }}>
                <Col span={12}>
                    <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>Rac</label>
                    <div style={{ width: '100%' }}>
                        <SearchInput
                            style={{ width: '100%', paddingRight: '2px' }}
                            value={rac} onChange={onChangeRac}
                            theme={theme}
                            width="100%"
                            height={27}
                        />
                    </div>
                </Col>
                <Col span={11}>
                    <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}></span>Terms</label>
                    <div style={{ width: '100%' }}>
                        <SearchInput
                            placeholder="terms"
                            value={terms} onChange={onChangeTerms}
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
                    <SubmitButton onClick={onClickGet} text="Get"
                    ></SubmitButton>
                    {!showSubmitButton && <SubmitButton
                        onClick={onClickSubmit} text="Submit"></SubmitButton>}
                </Col>
            </Row>
            <Row justify="center" style={{ marginTop: '10px', width: '100%' }}>
                <Col style={{ display: "flex", justifyContent: "center", alignItems: "center", width: '100%' }}>
                    <div style={{ color: errorMessage === "Please complete all required fields." && "red", fontWeight: 600, textAlign: 'center', width: '90%', fontSize: '20px' }}>{errorMessage}</div>
                    {errorMessage && errorMessage !== "Please complete all required fields." &&
                        <div style={{ marginLeft: "25px" }}>
                            <ReusableTooltip title={copyMessage}
                                theme={theme}
                            >
                                <CopyOutlined onClick={onClicktoCopyUrl} />
                            </ReusableTooltip>
                        </div>}
                </Col>
            </Row>
        </div>
    );
};

export default AffinityUrlBuilder;