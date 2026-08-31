"use client"
import React from 'react';
import { Row, Col } from 'antd';
import { useState, useEffect } from 'react';
import SearchInput from '@/components/common/searchinput';
import SubmitButton from '@/components/common/submitbutton';

const TonicUrlBuilder = ({ defaultValues, indexValueForAccount, onReturnMessage, showSubmitButton, theme }) => {
    const [siteName, setSiteName] = useState('');
    const [keywords, setKeyWords] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [NetworkData, setNetworkData] = useState([]);


    const getUrlBuilderData = async () => {
        const network = "Tonic1";

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
                const defaultKeyword = indexValueForAccount?.split("/")[1]?.split("&")[3]?.split("=")[1];
                setSiteName(defaultSiteName);
                setKeyWords(defaultKeyword);
            } else {
                if (defaultValues) {
                    const defaultSiteName = defaultValues?.split("/")[0];
                    // const defaultKeyword = defaultValues?.split("/")[1]?.split("&")[3]?.split("=")[1];
                    setSiteName(defaultSiteName);
                    setKeyWords("");
                }
            }
        }
    };

    useEffect(() => {
        getUrlBuilderData();
    }, []);

    // Function to add a new item
    const onChangeSiteName = (event) => {
        setSiteName(event.target.value);
    }

    const onChangeKeyword = (event) => {
        setKeyWords(event.target.value);
    }

    const onClickClear = () => {
        setSiteName('');
        setKeyWords('');
        setErrorMessage('');
    }

    const onClickSubmit = () => {

        if (keywords && siteName) {
            let url = NetworkData?.businessData[0]?.url;

            url = url
                .replace("sitename_replace", siteName.trim())
                .replace("keywords_replace", keywords.trim());
            onReturnMessage(url);
        }
        else {
            setErrorMessage("Please complete all fields.");
        }
    }

    const onClickGet = () => {

        if (keywords && siteName) {
            let url = NetworkData?.businessData[0]?.url;

            url = url
                .replace("sitename_replace", siteName.trim())
                .replace("keywords_replace", keywords.trim());
            setErrorMessage(url);
        }
        else {
            setErrorMessage("Please complete all fields.");
        }
    }

    return (
        <div style={{ width: '100%' }}>
            <Row style={{ display: 'flex', alignItems: 'center', paddingBottom: '10px' }}>
                <Col style={{ display: 'flex', flexDirection: 'column' }} span={9}>
                    <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>Site Name</label>
                    <SearchInput
                        placeholder='Site Name'
                        value={siteName} required
                        onChange={onChangeSiteName}
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
                    >
                    </SubmitButton>
                </Col>
                <Col>
                    <SubmitButton
                        onClick={onClickGet}
                        text="Get"
                    ></SubmitButton>
                    {!showSubmitButton && <SubmitButton
                        text="Submit"
                        onClick={onClickSubmit}>
                    </SubmitButton>}
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

export default TonicUrlBuilder;