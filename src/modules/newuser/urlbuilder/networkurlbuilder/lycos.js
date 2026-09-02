"use client"
import React from 'react';
import { Row, Col } from 'antd';
import { useState, useEffect } from 'react';
import ReusableSelect from '@/components/newuser/select';
import SubmitButton from '@/components/common/submitbutton';
import SearchInput from '@/components/common/searchinput';
const LycosUrlBuilder = ({ defaultValues, indexValueForAccount, onReturnMessage, showSubmitButton, theme }) => {
    const [siteName, setSiteName] = useState('');
    const [keywords, setKeyWords] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [NetworkData, setNetworkData] = useState([]);
    const [sub_ids, setSub_ids] = useState([]);
    const [sub_id_value, setSub_id_value] = useState("{{campaign.id}}")
    const [click_id, setClick_id_value] = useState("None");
    const Click_ids = [{ key: "None", label: "None", value: "None" }, { key: "click_id", label: "Click_id", value: "click_id" },]
    const getUrlBuilderData = async () => {
        const network = "Lysoc";

        const response = await fetch(
            `/api/newuser/urlbuilderdata?network=${encodeURIComponent(network)}`,
            {
                method: "GET",
                cache: "no-store",
            }
        );


        const json = await response.json();
        if (response?.status === 200) {
            const keyValuePairs = json?.channels?.map(item => ({ key: item.name, value: item.value, label: item.name }))
            setSub_ids(keyValuePairs)
            setNetworkData(json)
            if (indexValueForAccount) {
                const parsedindexValueForAccountUrl = new URL(indexValueForAccount);
                const defaultSub_id = parsedindexValueForAccountUrl.searchParams.get("type");
                const defaultKeyword = parsedindexValueForAccountUrl.searchParams.get("kw");
                const defaultClid = parsedindexValueForAccountUrl.searchParams.get("clid");
                setSub_id_value(defaultSub_id);
                setKeyWords(defaultKeyword);
                if (defaultClid) {
                    setClick_id_value(defaultClid)
                } else {
                    setClick_id_value("None");
                }
            } else {
                if (defaultValues) {
                    const parsedindexValueForAccountUrl = new URL(defaultValues);
                    const defaultSub_id = parsedindexValueForAccountUrl.searchParams.get("type");
                    const defaultClid = parsedindexValueForAccountUrl.searchParams.get("clid");
                    setSub_id_value(defaultSub_id);
                    setKeyWords("");
                    if (defaultClid) {
                        setClick_id_value(defaultClid)
                    } else {
                        setClick_id_value("None");
                    }
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
        setSub_id_value("{{campaign.id}}");
        setClick_id_value("None");
        setErrorMessage('');
    }
    const onClickSubmit = () => {
        if (!keywords || !sub_id_value || !click_id) {
            setErrorMessage("Please complete all fields.");
            return;
        }

        if (click_id !== "None" && !siteName?.trim()) {
            setErrorMessage("Please enter a valid Click ID.");
            return;
        }

        let url = NetworkData?.Domains[0]?.url;

        url = url
            .replace("$sub_id", sub_id_value?.trim() || "")
            .replace("$keyword", keywords.trim());
        if (click_id !== "None") {
            url = url.replace("$click_id", siteName?.trim() || "");
        } else {
            url = url.replace("&clid=$click_id", "");
        }

        onReturnMessage(url);
    };
    const onClickGet = () => {
        if (!keywords || !sub_id_value || !click_id) {
            setErrorMessage("Please complete all fields.");
            return;
        }

        if (click_id !== "None" && !siteName?.trim()) {
            setErrorMessage("Please enter a valid Click ID.");
            return;
        }

        let url = NetworkData?.Domains[0]?.url;

        url = url
            .replace("$sub_id", sub_id_value?.trim() || "")
            .replace("$keyword", keywords.trim());
        if (click_id !== "None") {
            url = url.replace("$click_id", siteName?.trim() || "");
        } else {
            url = url.replace("&clid=$click_id", "");
        }

        setErrorMessage(url);
    };

    return (
        <div style={{ width: '100%' }}>
            <Row style={{ display: 'flex', alignItems: 'center', paddingBottom: '10px', gap: 10 }}>
                <Col style={{ display: 'flex', flexDirection: 'column' }} span={6}>
                    <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>Type</label>
                    <ReusableSelect
                        placeholder="Select Channel"
                        options={sub_ids} value={sub_id_value}
                        onChange={(value) => setSub_id_value(value)}
                        width="100%"
                        size="small"
                        height={27}
                        theme={theme}
                    />
                </Col>
                <Col style={{ display: 'flex', flexDirection: 'column' }} span={6}>
                    <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>Click_id</label>
                    <ReusableSelect
                        placeholder="Select Channel"
                        options={Click_ids} value={click_id}
                        onChange={(value) => setClick_id_value(value)}
                        width="100%"
                        size="small"
                        height={27}
                        theme={theme}
                    />
                </Col>
                {click_id !== "None" && <Col style={{ display: 'flex', flexDirection: 'column' }} span={9}>
                    <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>Click_id Value</label>
                    <SearchInput
                        placeholder='Click Id'
                        value={siteName} required
                        onChange={onChangeSiteName}
                        theme={theme}
                        width="100%"
                        height={27}
                    ></SearchInput>
                </Col>}
            </Row>
            <Row style={{ width: '100%' }}>
                <Col span={24}>
                    <label><span style={{ color: 'red', paddingRight: '2px', paddingTop: '2px' }}>*</span>Keyword</label>
                    <div style={{ width: '100%' }}>

                        <SearchInput
                            placeholder="Key word"
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
                            onClick={onClickSubmit}>
                        </SubmitButton>}
                </Col>
            </Row>
            <Row justify="center" style={{ marginTop: '10px' }}>
                <Col>
                    <p style={{ color: errorMessage === "Please complete all fields." || errorMessage === "Please enter a valid Click ID." && "red", fontWeight: 600, textAlign: 'center', width: '100%', fontSize: '20px' }}>{errorMessage}</p>
                </Col>
            </Row>
        </div>
    );
};

export default LycosUrlBuilder;