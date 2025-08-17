import { useEffect, useState } from "react";

export default function useDebounce(inputValue,delay=500){
    const [debouncedValue, setDebouncedValue] = useState(inputValue);

    useEffect(function(){
      const t = setTimeout(()=> setDebouncedValue(inputValue),delay);
      
      return ()=> clearTimeout(t);
    },[inputValue,delay])

    return debouncedValue;
}