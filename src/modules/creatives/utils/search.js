import { useEffect, useState } from "react";

export default function useSearch(items = []) {
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredItems, setFilteredItems] = useState([]);

    // Whenever images/items change,
    // reset the search results to the latest items.
    useEffect(() => {
        setFilteredItems(items);
    }, [items]);

    // Called when user types in SearchInput.
    // IMPORTANT: value must be a string.
    const handleSearch = (value) => {
        const query = value.toLowerCase();

        setSearchQuery(query);

        // Empty search = show everything.
        if (!query.trim()) {
            setFilteredItems(items);
            return;
        }

        // Search by file/folder name.
        const filtered = items.filter((item) =>
            item.name?.toLowerCase().includes(query)
        );

        setFilteredItems(filtered);
    };

    // Clear search and show everything again.
    const clearSearch = () => {
        setSearchQuery("");
        setFilteredItems(items);
    };

    return {
        searchQuery,
        filteredItems,
        handleSearch,
        clearSearch,
    };
}