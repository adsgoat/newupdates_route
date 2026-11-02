"use client"
import React, { useEffect } from 'react';
import { Button, Input, Select, Row, Col, Tooltip } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { useState } from 'react';
import axios from 'axios';
const AffinityUrlBuilder = ({ defaultValues, indexValueForAccount, onReturnMessage, showSubmitButton, accountis, primaryText,
    headline, description, campaign_name, theme }) => {
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
    const [pixelId, setPixelId] = useState('PixelId');
    const [tmp, setTmp] = useState('9');
    const [tmpIds, setTmpIds] = useState([]);
    const pixelIds = ['PixelId', 'None'];
    const [domainExtension, setDomainExtension] = useState('');
    const [copyMessage, setCopyMessage] = useState('Click to copy');
    const token = localStorage.getItem("token")
    const combinedRac =
        [primaryText, headline, description]
            .filter(Boolean)
            .join(",");
    const DataToSend = "domain_extension_replace?src=src_replace&pxi=835172915206585&channel=channel_replace&terms=terms_replace&rac=rac_replace&utm_campaign=utm_campaign_replace&sltId=sltId_replace&tmp=tmp_replace";
    // const getUrlBuilderData = async () => {
    //     const response = await fetch(
    //         `/api/campaigns/urlbuilder?network=Affinity`,
    //         {
    //             method: "GET",
    //             headers: { Authorization: token },
    //         },
    //     )
    //     const json = await response.json();
    //     if (response?.status === 200) {
    //         setTmpIds(json?.tmps.map(item => ({
    //             label: item.name,
    //             value: item.value
    //         })) || []);
    //         setNetworkData(json)
    //         if (indexValueForAccount) {
    //             const domainValue = indexValueForAccount.split("?")[0];
    //             const tmpValue = new URL(indexValueForAccount).searchParams.get("tmp");
    //             const sltIdValue = new URL(indexValueForAccount).searchParams.get("sltId");
    //             const channelValue = new URL(indexValueForAccount).searchParams.get("channel");
    //             const utm_campaignValue = new URL(indexValueForAccount).searchParams.get("utm_campaign");
    //             const racValue = new URL(indexValueForAccount).searchParams.get("rac");
    //             const termsValue = new URL(indexValueForAccount).searchParams.get("terms");
    //             const pixelValue = new URL(indexValueForAccount).searchParams.get("pxi");
    //             setTerms(termsValue ? termsValue.replace(/%20/g, " ") : "");
    //             setKeyWords(utm_campaignValue ? utm_campaignValue.trim().replace(/%20/g, " ") : "");
    //             setDomainExtension(domainValue);
    //             setRac(
    //                 racValue
    //                     ? decodeURIComponent(racValue).replace(/\+/g, " ")
    //                     : ""
    //             );
    //             setTmp(tmpValue || '9');
    //             setChannel(sltIdValue || "1675913170");
    //             setChannel_id(channelValue || '');
    //             setPixelId(pixelValue ? 'PixelId' : 'None');
    //             setSource("fb");
    //         } else {
    //             if (defaultValues) {
    //                 console.log(defaultValues);
    //                 const domainValue = defaultValues.split("?")[0];
    //                 const tmpValue = new URL(defaultValues).searchParams.get("tmp");
    //                 const sltIdValue = new URL(defaultValues).searchParams.get("sltId");
    //                 const channelValue = new URL(defaultValues).searchParams.get("channel");
    //                 const utm_campaignValue = new URL(defaultValues).searchParams.get("utm_campaign");
    //                 const racValue = new URL(defaultValues).searchParams.get("rac");
    //                 const termsValue = new URL(defaultValues).searchParams.get("terms");
    //                 const pixelValue = new URL(defaultValues).searchParams.get("pxi");
    //                 setTerms(termsValue ? termsValue.replace(/%20/g, " ") : "");
    //                 setKeyWords(utm_campaignValue ? utm_campaignValue.trim().replace(/%20/g, " ") : "");
    //                 setDomainExtension(domainValue);
    //                 setRac(
    //                     racValue
    //                         ? decodeURIComponent(racValue).replace(/\+/g, " ")
    //                         : ""
    //                 );
    //                 setTmp(tmpValue || '9');
    //                 setChannel(sltIdValue || "1675913170");
    //                 setChannel_id(channelValue || '');
    //                 setPixelId(pixelValue ? 'PixelId' : 'None');
    //                 setSource("fb");
    //             }
    //         }
    //     }

    // };
    const getUrlBuilderData = async () => {
        try {
            const { data } = await axios.get("/api/campaigns/urlbuilder", {
                params: { network: "Affinity" },
                headers: { Authorization: token },
            });

            setTmpIds(
                data?.tmps?.map(item => ({
                    label: item.name,
                    value: item.value,
                })) || []
            );

            setNetworkData(data);

            const url = indexValueForAccount || defaultValues;
            if (!url) return;

            const parsedUrl = new URL(url);
            const params = parsedUrl.searchParams;

            const tmpValue = params.get("tmp");
            const sltIdValue = params.get("sltId");
            const channelValue = params.get("channel");
            const utmCampaignValue = params.get("utm_campaign");
            const racValue = params.get("rac");
            const termsValue = params.get("terms");
            const pixelValue = params.get("pxi");

            setTerms(termsValue || "");
            setKeyWords(
                indexValueForAccount
                    ? utmCampaignValue?.trim() || ""
                    : ""
            );
            setDomainExtension(url.split("?")[0]);
            setRac(
                racValue
                    ? decodeURIComponent(racValue).replace(/\+/g, " ")
                    : ""
            );
            setTmp(tmpValue || "9");
            setChannel(sltIdValue || "1675913170");
            setChannel_id(channelValue || "");
            setPixelId(pixelValue ? "PixelId" : "None");
            setSource("fb");
        } catch (error) {
            console.error(
                "Failed to fetch URL builder data:",
                error.response?.data || error.message
            );
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


    const onChangeSource = (value) => {
        setSource(value);
    }

    const onChangeChannel = (value) => {
        setChannel(value)
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
            <Row style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '10px' }}>
                <Col style={{ display: 'flex', flexDirection: 'column' }} span={3}>
                    <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>Source</label>
                    <Select
                        showSearch
                        required
                        placeholder="Source"
                        value={source}
                        onChange={onChangeSource}
                        options={NetworkData?.Source?.map((item) => ({
                            value: item.code,
                            label: item.name,
                        }))}
                        classNames={{ popup: theme === 'dark' ? 'custom-dropdown' : undefined }}
                        className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                    />
                </Col>
                <Col style={{ display: 'flex', flexDirection: 'column' }} span={6}>
                    <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>Sltid</label>
                    <Select
                        showSearch
                        placeholder="sltid"
                        value={channel}
                        required
                        onChange={onChangeChannel}
                        options={NetworkData?.channels
                            ?.filter((item) => item.source === source)
                            ?.map((item) => ({
                                value: item.value,
                                label: item.name,
                            }))}
                        style={{ width: '100%' }}
                        classNames={{ popup: theme === 'dark' ? 'custom-dropdown' : undefined }}
                        className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                    />
                </Col>
                <Col style={{ display: 'flex', flexDirection: 'column', marginBottom: '5px' }} xs={11} sm={5} lg={4}>
                    <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>PixelId</label>
                    <Select
                        showSearch
                        placeholder="pixelId"
                        value={pixelId}
                        required
                        onChange={onChangePixelId}
                        options={pixelIds.map((item) => ({
                            label: item,
                            value: item
                        }))}
                        style={{ width: '100%' }}
                        classNames={{ popup: theme === 'dark' ? 'custom-dropdown' : undefined }}
                        className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                    />
                </Col>
                <Col style={{ display: 'flex', flexDirection: 'column', marginBottom: '5px' }} xs={11} sm={5} lg={4}>
                    <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>Tmp</label>
                    <Select
                        showSearch
                        placeholder="tmp"
                        value={tmp}
                        required
                        onChange={onChangeTmpId}
                        options={tmpIds}
                        style={{ width: '100%' }}
                        classNames={{ popup: theme === 'dark' ? 'custom-dropdown' : undefined }}
                        className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                    />
                </Col>
                <Col span={5}>
                    <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>Channel</label>
                    <div style={{ width: '100%' }}>
                        <Input placeholder="channel" style={{ width: '100%', paddingRight: '2px' }} value={channel_id} onChange={onChangeChannel_id} className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} />
                    </div>
                </Col>
            </Row>
            <Row style={{ width: '100%', display: 'flex', justifyContent: "space-between" }}>
                <Col span={12}>
                    <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>Article</label>
                    <div style={{ width: '100%' }}>
                        <Input placeholder="article" style={{ width: '100%', paddingRight: '2px' }} value={domainExtension} onChange={onChangeDomainExtension} className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} />
                    </div>
                </Col>
                <Col span={11}>
                    <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>Utm_campaign</label>
                    <div style={{ width: '100%' }}>
                        <Input placeholder="utm_campaign" style={{ width: '100%', paddingRight: '2px' }} value={keywords} onChange={onChangeKeyword} className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} />
                    </div>
                </Col>
            </Row>
            <Row style={{ width: '100%', display: 'flex', justifyContent: "space-between", marginTop: '10px' }}>
                <Col span={12}>
                    <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>Rac</label>
                    <div style={{ width: '100%' }}>
                        <Input placeholder="rac" style={{ width: '100%', paddingRight: '2px' }} value={rac} onChange={onChangeRac} className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} />
                    </div>
                </Col>
                <Col span={11}>
                    <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}></span>Terms</label>
                    <div style={{ width: '100%' }}>
                        <Input placeholder="terms" style={{ width: '100%', paddingRight: '2px' }} value={terms} onChange={onChangeTerms} className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} />
                    </div>
                </Col>
            </Row>

            <Row justify="space-between" style={{ marginTop: '20px' }}>
                <Col>
                    <Button
                        type="default"
                        onClick={onClickClear}
                        style={{ backgroundColor: '#d3d3d3', borderColor: '#d3d3d3', color: 'black' }}
                    >Clear</Button>
                </Col>
                <Col>
                    <Button onClick={onClickGet} style={{ marginRight: '10px', backgroundColor: '#b7e8c6', borderColor: '#b7e8c6', color: 'black' }}>Get</Button>
                    {!showSubmitButton && <Button style={{ backgroundColor: '#91C25F', color: "#000", borderColor: '#91C25F', borderWidth: "0px" }} onClick={onClickSubmit}>Submit</Button>}
                </Col>
            </Row>
            <Row justify="center" style={{ marginTop: '10px', width: '100%' }}>
                <Col style={{ display: "flex", justifyContent: "center", alignItems: "center", width: '100%' }}>
                    <div style={{ color: errorMessage === "Please complete all required fields." && "red", fontWeight: 600, textAlign: 'center', width: '90%', fontSize: '20px' }}>{errorMessage}</div>
                    {errorMessage && errorMessage !== "Please complete all required fields." &&
                        <div style={{ marginLeft: "25px" }}>
                            <Tooltip title={copyMessage}
                                styles={{
                                    container:{
                                    backgroundColor: theme === 'dark' ? '#111' : '#fff',
                                    color: theme === 'dark' ? '#fff' : '#000',
                                    border: '1px solid #ccc',
                                    borderRadius: 6,
                                    // fontWeight: 500,
                                }
                                }}
                            >
                                <CopyOutlined onClick={onClicktoCopyUrl} />
                            </Tooltip>
                        </div>}
                </Col>
            </Row>
        </div>
    );
};

export default AffinityUrlBuilder;