"use client";

import { Card, Form, Input, Select, Space, Typography } from "antd";

const { Text } = Typography;

const getAccountKey = account =>
    String(
        account?.accountNumber ??
        account?.accountId ??
        account?.id ??
        ""
    );

const getAccountLabel = account =>
    account?.accountName ??
    account?.name ??
    account?.accountNumber ??
    account?.accountId ??
    "Advertising Account";

const AccountAdSettings = ({
    form,
    adPath,
    selectedAccounts = [],
    pagesByAccount = {},
    instagramAccountsByAccount = {},
    disabled = false
}) => {
    const accounts = selectedAccounts.filter(account => getAccountKey(account));

    return (
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
            {accounts.map(account => {
                const accountKey = getAccountKey(account);
                const accountPath = [
                    ...adPath,
                    "accountSettings",
                    accountKey
                ];

                const pages =
                    pagesByAccount[accountKey] ||
                    account.pages ||
                    [];

                const instagramAccounts =
                    instagramAccountsByAccount[accountKey] ||
                    account.instagramAccounts ||
                    [];

                const pageOptions = pages.map(page => ({
                    value: String(
                        page.pageId ??
                        page.id ??
                        page.value ??
                        ""
                    ),
                    label:
                        page.pageName ??
                        page.name ??
                        page.label ??
                        String(page.pageId ?? page.id ?? page.value ?? "")
                })).filter(option => option.value);

                const instagramOptions = instagramAccounts.map(item => ({
                    value: String(
                        item.instagramAccountId ??
                        item.id ??
                        item.value ??
                        ""
                    ),
                    label:
                        item.username ??
                        item.name ??
                        item.label ??
                        String(item.instagramAccountId ?? item.id ?? item.value ?? "")
                })).filter(option => option.value);

                return (
                    <Card
                        key={accountKey}
                        size="small"
                        title={getAccountLabel(account)}
                        style={{ width: "100%" }}
                    >
                        <Space
                            direction="vertical"
                            size={8}
                            style={{ width: "100%" }}
                        >
                            <Text type="secondary">
                                Account-specific identity and creative settings
                            </Text>

                            <Form.Item
                                name={[...accountPath, "pageId"]}
                                label="Facebook Page"
                                rules={[
                                    {
                                        required: true,
                                        message: "Select a Facebook Page for this account."
                                    }
                                ]}
                            >
                                <Select
                                    showSearch
                                    allowClear
                                    disabled={disabled}
                                    placeholder="Select Facebook Page"
                                    options={pageOptions}
                                    optionFilterProp="label"
                                    notFoundContent="No pages available for this account"
                                />
                            </Form.Item>

                            <Form.Item
                                name={[...accountPath, "instagramAccountId"]}
                                label="Instagram Account"
                            >
                                <Select
                                    showSearch
                                    allowClear
                                    disabled={disabled}
                                    placeholder="Select Instagram Account"
                                    options={instagramOptions}
                                    optionFilterProp="label"
                                    notFoundContent="No Instagram accounts available"
                                />
                            </Form.Item>

                            <Form.Item
                                name={[...accountPath, "displayLink"]}
                                label="Display Link"
                                rules={[
                                    {
                                        required: true,
                                        whitespace: true,
                                        message: "Enter a display link for this account."
                                    }
                                ]}
                            >
                                <Input
                                    disabled={disabled}
                                    placeholder="e.g. www.example.com"
                                    maxLength={255}
                                />
                            </Form.Item>

                            <Form.Item
                                name={[...accountPath, "caption"]}
                                label="Caption"
                                rules={[
                                    {
                                        required: true,
                                        whitespace: true,
                                        message: "Enter a caption for this account."
                                    }
                                ]}
                            >
                                <Input.TextArea
                                    disabled={disabled}
                                    placeholder="Enter account-specific caption"
                                    autoSize={{ minRows: 2, maxRows: 5 }}
                                    maxLength={2200}
                                    showCount
                                />
                            </Form.Item>

                            <Text strong>Optional creative overrides</Text>

                            <Form.Item
                                name={[
                                    ...accountPath,
                                    "creativeOverrides",
                                    "primaryText"
                                ]}
                                label="Primary Text Override"
                            >
                                <Input.TextArea
                                    disabled={disabled}
                                    placeholder="Leave blank to use shared primary text"
                                    autoSize={{ minRows: 2, maxRows: 5 }}
                                />
                            </Form.Item>

                            <Form.Item
                                name={[
                                    ...accountPath,
                                    "creativeOverrides",
                                    "headline"
                                ]}
                                label="Headline Override"
                            >
                                <Input
                                    disabled={disabled}
                                    placeholder="Leave blank to use shared headline"
                                />
                            </Form.Item>

                            <Form.Item
                                name={[
                                    ...accountPath,
                                    "creativeOverrides",
                                    "description"
                                ]}
                                label="Description Override"
                            >
                                <Input
                                    disabled={disabled}
                                    placeholder="Leave blank to use shared description"
                                />
                            </Form.Item>
                        </Space>
                    </Card>
                );
            })}
        </Space>
    );
};

export { getAccountKey };
export default AccountAdSettings;