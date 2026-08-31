"use client"
import React, { useEffect } from 'react';
import { Row, Col } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { useState } from 'react';
import SubmitButton from '@/components/common/submitbutton';
import SearchInput from '@/components/common/searchinput';
import ReusableSelect from '@/components/newuser/select';
import ReusableTooltip from '@/components/newuser/tooltip';
;
const CompadoUrlBuilder = ({ defaultValues, indexValueForAccount, onReturnMessage, showSubmitButton, accountis, theme }) => {
    // Initial data array
    console.log("compado")
    const [domain, setDomain] = useState(null);
    const [source, setSource] = useState("facebook");
    const [channel, setChannel] = useState("adid");
    const [memberId, setMembetId] = useState('');
    const [geo, setGeo] = useState('');
    const [keywords, setKeyWords] = useState('');
    const [channel_id, setChannel_id] = useState('');
    const [rac, setRac] = useState('');
    const [terms, setTerms] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [NetworkData, setNetworkData] = useState([]);
    const [copyText, setCopyText] = useState('Copy');
    const [pixelId, setPixelId] = useState('include_year_in_title');
    const [tmp, setTmp] = useState('include_country_in_title');
    const [tmpIds, setTmpIds] = useState([]);
    const pixelIds = ['PixelId', 'None'];
    const [domainExtension, setDomainExtension] = useState('');
    const [copyMessage, setCopyMessage] = useState('Click to copy');

    // const DataToSend = "domain_extension_replace?src=src_replace&pxi=835172915206585&channel=channel_replace&terms=terms_replace&rac=rac_replace&utm_campaign=utm_campaign_replace&sltId=sltId_replace&tmp=tmp_replace";
    const DataToSend = "http://domain_extension_replace/dsr/keyword_replace/?adx_title=adx_title_replace&adx_publisher_id=adx_publisher_id_replace&srcclkid=srcclkid_replace&utm_source=facebook&adid={{ad.id}}&include_year_in_title&include_country_in_title"
    useEffect(() => {
        setDomain(null)
        setSource("facebook");
        setChannel("adid");
        setGeo('');
        setMembetId('');
        setKeyWords('');
        setErrorMessage('');
        setPixelId('include_year_in_title');
    }, [accountis]);



    const onChangePixelId = (value) => {
        setPixelId(value);
    }

    const onChangeTmpId = (value) => {
        setTmp(value);
    }

    // Function to add a new item

    const onClickClear = () => {
        setDomain(null)
        setSource("facebook");
        setChannel("adid");
        setGeo('');
        setMembetId('');
        setKeyWords('');
        setErrorMessage('');
        setPixelId('include_year_in_title');
        setChannel_id('');
        setRac('');
        setTerms('');
        setTmp('include_country_in_title');
        setDomainExtension('');
    }
    console.log(showSubmitButton);

    const onClickSubmit = () => {

        if (keywords && channel && domainExtension && source && pixelId && channel_id && rac && terms && tmp) {
            let url = DataToSend;
            const racValue = rac ? rac.trim() : '';

            if (pixelId === 'include_year_in_title') {
                url = url;
            }
            else {
                // const newDomain = domain.split("&trkfb");
                url = url.replace("&include_year_in_title", "");
            }
            if (tmp === 'include_country_in_title') {
                url = url;
            }
            else {
                // const newDomain = domain.split("&trkfb");
                url = url.replace("&include_country_in_title", "");
            }
            if (channel === 'adid') {
                url = url;
            }
            else {
                // const newDomain = domain.split("&trkfb");
                url = url.replace("&adid={{ad.id}}", "");
            }
            if (source === 'facebook') {
                url = url;
            }
            else {
                // const newDomain = domain.split("&trkfb");
                url = url.replace("&utm_source=facebook", "");
            }
            console.log(racValue, keywords, terms, channel_id, domainExtension);
            url = url.replace("srcclkid_replace", racValue)
                .replace("keyword_replace", keywords.trim())
                .replace("adx_title_replace", terms.trim())
                .replace("adx_publisher_id_replace", channel_id.trim())
                .replace("domain_extension_replace", domainExtension.trim())

            onReturnMessage(url);
            setErrorMessage(url);
        }
        else {
            setErrorMessage("Please complete all required fields.");
        }
    }

    const onClickGet = () => {

        if (keywords && channel && domainExtension && source && pixelId && channel_id && rac && terms && tmp) {
            // const formattedKeywords = keywords.trimEnd().replace(/\s+/g, '+');
            // const campaign_id = NetworkData?.Source?.find(item => item.code === source).campaignId;
            // const adset_id = NetworkData?.Source?.find(item => item.code === source).AdsetId;
            // const ad_id = NetworkData?.Source?.find(item => item.code === source).AdId;
            let url = DataToSend;
            const racValue = rac ? rac.trim() : '';

            if (pixelId === 'include_year_in_title') {
                url = url;
            }
            else {
                // const newDomain = domain.split("&trkfb");
                url = url.replace("&include_year_in_title", "");
            }
            if (tmp === 'include_country_in_title') {
                url = url;
            }
            else {
                // const newDomain = domain.split("&trkfb");
                url = url.replace("&include_country_in_title", "");
            }
            if (channel === 'adid') {
                url = url;
            }
            else {
                // const newDomain = domain.split("&trkfb");
                url = url.replace("&adid={{ad.id}}", "");
            }
            if (source === 'facebook') {
                url = url;
            }
            else {
                // const newDomain = domain.split("&trkfb");
                url = url.replace("&utm_source=facebook", "");
            }
            console.log(racValue, keywords, terms, channel_id, domainExtension);
            url = url.replace("srcclkid_replace", racValue)
                .replace("keyword_replace", keywords.trim())
                .replace("adx_title_replace", terms.trim())
                .replace("adx_publisher_id_replace", channel_id.trim())
                .replace("domain_extension_replace", domainExtension.trim())

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
            <Row style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '10px' }}>

                <Col style={{ display: 'flex', flexDirection: 'column' }} span={3}>
                    <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>Utm_source</label>
                    <ReusableSelect
                        showSearch
                        required
                        placeholder="Source"
                        value={source}
                        onChange={onChangeSource}
                        width="100%"
                        size="small"
                        height={27}
                        theme={theme}
                        options={

                            [{ value: "facebook", label: "facebook" }, { value: "None", label: "None" }]
                        }
                    />
                </Col>
                <Col style={{ display: 'flex', flexDirection: 'column' }} span={6}>
                    <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>Adid</label>
                    <ReusableSelect
                        showSearch
                        placeholder="adid"
                        value={channel}
                        required
                        onChange={onChangeChannel}
                        options={
                            [{ value: "adid", label: "adid" }, { value: "None", label: "None" }]
                        }
                        width="100%"
                        size="small"
                        height={27}
                        theme={theme}

                    />
                </Col>
                <Col style={{ display: 'flex', flexDirection: 'column', marginBottom: '5px' }} xs={11} sm={5} lg={4}>
                    <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>Include_year_in_title</label>
                    <ReusableSelect
                        showSearch
                        placeholder="include_year_in_title"
                        value={pixelId}
                        required
                        onChange={onChangePixelId}
                        options={
                            [{ value: "include_year_in_title", label: "include_year_in_title" }, { value: "None", label: "None" }]
                        }
                        width="100%"
                        size="small"
                        height={27}
                        theme={theme}

                    />
                </Col>
                <Col style={{ display: 'flex', flexDirection: 'column', marginBottom: '5px' }} xs={11} sm={5} lg={4}>
                    <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>include_country_in_title</label>
                    <ReusableSelect
                        showSearch
                        placeholder="include_country_in_title"
                        value={tmp}
                        required
                        onChange={onChangeTmpId}
                        options={
                            [{ value: "include_country_in_title", label: "include_country_in_title" }, { value: "None", label: "None" }]
                        }
                        width="100%"
                        size="small"
                        height={27}
                        theme={theme}
                    />
                </Col>

            </Row>
            <Row style={{ width: '100%', display: 'flex', justifyContent: "space-between" }}>

                <Col span={12}>
                    <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>Domain</label>
                    <div style={{ width: '100%' }}>
                        <SearchInput
                            placeholder="domain"
                            value={domainExtension}
                            onChange={onChangeDomainExtension}
                            theme={theme}
                            width="100%"
                            height={27}
                        />
                    </div>
                </Col>
                <Col span={6}>
                    <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>Adx_publisher_id</label>
                    <div style={{ width: '100%' }}>
                        <SearchInput
                            placeholder="adx_publisher_id"
                            value={channel_id} onChange={onChangeChannel_id}
                            theme={theme}
                            width="100%"
                            height={27}
                        />
                    </div>
                </Col>
                <Col span={5}>
                    <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>Srcclkid</label>
                    <div style={{ width: '100%' }}>
                        <SearchInput
                            placeholder="srcclkid"
                            value={rac} onChange={onChangeRac}
                            theme={theme}
                            width="100%"
                            height={27}
                        />
                    </div>
                </Col>
            </Row>
            <Row style={{ width: '100%', display: 'flex', justifyContent: "space-between", marginTop: '10px' }}>
                <Col span={12}>
                    <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>Keyword</label>
                    <div style={{ width: '100%' }}>
                        <SearchInput
                            placeholder="keyword"
                            onChange={onChangeKeyword}
                            theme={theme}
                            width="100%"
                            height={27}
                        />
                    </div>
                </Col>
                <Col span={11}>
                    <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>Adx_title</label>
                    <div style={{ width: '100%' }}>
                        <SearchInput
                            placeholder="adx_title"
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
                    <SubmitButton
                        onClick={onClickGet}
                        text="Get"
                    >
                    </SubmitButton>
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

export default CompadoUrlBuilder;