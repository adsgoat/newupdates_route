"use client"
import React, { useEffect } from 'react';
import { Button, Input, Select, Row, Col } from 'antd';
import { useState } from 'react';
import axios from 'axios';
const MnetUrlBuilder = ({ defaultValues, indexValueForAccount, onReturnMessage, showSubmitButton, accountis, theme }) => {
    const [domain, setDomain] = useState(null);
    const [source, setSource] = useState("FB");
    const [channel, setChannel] = useState(null);
    const [memberId, setMembetId] = useState('');
    const [geo, setGeo] = useState('');
    const [keywords, setKeyWords] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [NetworkData, setNetworkData] = useState([]);
    const [pixelId, setPixelId] = useState('PixelId');
    const pixelIds = ['PixelId', 'None'];

    const getUrlBuilderData = async () => {
        try {
            const { data } = await axios.get("/api/campaigns/urlbuilder", {
                params: { network: "Mnet" },
                headers: { Authorization: localStorage.getItem("token") },
            });

            setNetworkData(data);

            const url = indexValueForAccount || defaultValues;
            if (!url) return;

            const parts = url.split("//")[1]?.split("/") || [];
            const tracking = parts[4]?.split("&") || [];
            const [memberId, , geo] = tracking[1]?.split("=")[1]?.split("_") || [];

            setDomain(data?.Domains?.find(item => item.url?.includes(parts[0]))?.url || null);
            setKeyWords(indexValueForAccount ? parts[3]?.replace(/\+/g, " ") || "" : "");
            setChannel(tracking[0]?.split("?")[1] || null);
            setMembetId(memberId || "");
            setSource("FB");
            setGeo(geo || "");
            setPixelId(url.includes("&trkfb") ? "PixelId" : "None");
        } catch (error) {
            console.error("Failed to fetch URL builder data:", error.response?.data || error.message);
        }
    };

    useEffect(() => {
        setDomain(null)
        setSource("FB");
        setChannel(null);
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


    const onClickClear = () => {
        setDomain(null)
        setSource("FB");
        setChannel(null);
        setGeo('');
        setMembetId('');
        setKeyWords('');
        setErrorMessage('');
        setPixelId('PixelId');
    }

    const onClickSubmit = () => {

        if (keywords && channel && domain && source && pixelId) {
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

            url = url
                .replace("keywords_replace", formattedKeywords)
                .replace("chanel_replace", channel)
                .replace("business_code_replace_source_code_replace_region_code_replace", ad_id)
                .replace("campaign_id_replace", campaign_id)
                .replace("adset_id_replace", adset_id);
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

            url = url
                .replace("keywords_replace", formattedKeywords)
                .replace("chanel_replace", channel)
                .replace("business_code_replace_source_code_replace_region_code_replace", ad_id)
                .replace("campaign_id_replace", campaign_id)
                .replace("adset_id_replace", adset_id);
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

    const onChangeKeyword = (event) => {
        setKeyWords(event.target.value)
    }

    return (
        <div style={{ width: '100%' }}>
            <Row style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '10px' }}>
                <Col style={{ display: 'flex', flexDirection: 'column' }} span={6}>
                    <label><span style={{ color: 'red', margin: '2px' }}>*</span>Domain</label>
                    <Select
                        showSearch
                        required
                        placeholder="Select Domain"
                        value={domain}
                        style={{ width: '100%' }}
                        onChange={onChangeDomian}
                        options={NetworkData?.Domains?.map((item) => ({
                            value: item.url,
                            label: item.name,
                        }))}
                        classNames={{ popup: { root: theme === 'dark' ? 'custom-dropdown' : undefined } }}
                        className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                    />
                </Col>
                <Col style={{ display: 'flex', flexDirection: 'column' }} span={4}>
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
                        classNames={{ popup: { root: theme === 'dark' ? 'custom-dropdown' : undefined } }}
                        className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                    />
                </Col>
                <Col style={{ display: 'flex', flexDirection: 'column' }} span={3}>
                    <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>Channels</label>
                    <Select
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
                        style={{ width: '100%' }}
                        classNames={{ popup: { root: theme === 'dark' ? 'custom-dropdown' : undefined } }}
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
                        classNames={{ popup: { root: theme === 'dark' ? 'custom-dropdown' : undefined } }}
                        className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                    />
                </Col>
            </Row>
            <Row style={{ width: '100%' }}>
                <Col span={24}>
                    <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>Keywords</label>
                    <div style={{ width: '100%' }}>
                        <Input placeholder="Keywords" style={{ width: '100%', paddingRight: '2px' }} value={keywords} onChange={onChangeKeyword} className={theme === 'dark' ? 'custom-input-dark' : 'custom-input-light'} />
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
            <Row justify="center" style={{ marginTop: '10px' }}>
                <Col>
                    <p style={{ color: errorMessage === "Please complete all fields." && "red", fontWeight: 600, textAlign: 'center', width: '100%', fontSize: '20px' }}>{errorMessage}</p>
                </Col>
            </Row>
        </div>
    );
};

export default MnetUrlBuilder;