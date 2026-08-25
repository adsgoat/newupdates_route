"use client";

import { Input } from "antd";

export default function SearchInput({
  value,
  onChange,
  onClick,
  onKeyDown,
  placeholder,
  theme,
  width = "100%",
  height = 32,
  allowClear = true,
  disabled = false,
}) {
  return (
    <Input
      value={value}
      onChange={onChange}
      onClick={onClick}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      allowClear={allowClear}
      disabled={disabled}
      style={{ width, height }}
      // className={`${
      //   theme === "dark" ? "dark-theme" : "light-theme"
      // } green-border-input`}
    />
  );
}