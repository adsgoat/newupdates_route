"use client";

import { Input } from "antd";
import "../../styles/newuser.css"

export default function SearchInput({
  value,
  onChange,
  onClick,
  onKeyDown,
  placeholder,
  theme,
  type,
  width = "100%",
  height = 32,
  allowClear = true,
  disabled = false,
}) {
  const isDark = theme === "dark";

  return (
    <Input
      value={value}
      type={type}
      onChange={onChange}
      onClick={onClick}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      allowClear={allowClear}
      disabled={disabled}
      variant="outlined"
      className={isDark ? "search-input-dark" : "search-input-light"}
      style={{
        width,
        height,
        border: "1px solid #91C25F",
        backgroundColor: isDark
          ? "#383535"
          : "#ffffff",
        color: isDark
          ? "#ffffff"
          : "#333333",
      }}
    />
  );
}