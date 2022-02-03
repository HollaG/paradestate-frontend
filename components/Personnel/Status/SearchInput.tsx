import { InputGroup, InputLeftAddon, Input } from "@chakra-ui/react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

const SearchInput:React.FC<{
    setSearch: Dispatch<SetStateAction<string>>
}> = ({setSearch}) => {
    const [searchValue, setSearchValue] = useState('')
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => { 
        if (e.target.value.length > 20) { 
            return
        } 
        setSearchValue(e.target.value)
    }
    const [isWaiting, setIsWaiting] = useState(false)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            // console.log("time out")

            // Run search query
            // if (searchValue.length)
                setSearch(searchValue)
        }, 500);
        return () => clearTimeout(timeoutId);
      }, [searchValue, setSearch]);
    return (
        <InputGroup size="sm" my={2}>
            <InputLeftAddon children="Search" />
            <Input placeholder="Search for personnel to add statuses for..." value={searchValue} onChange={handleSearch}></Input>
        </InputGroup>
    );
};

export default SearchInput;
