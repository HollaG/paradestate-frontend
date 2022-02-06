import { Box } from "@chakra-ui/react";

import React, { ReactNode } from "react";

const ClickedContainerWrapper = React.forwardRef<
    HTMLDivElement,
    {
        children: ReactNode;
        condition: boolean;
        scrollId: string;
    }
>(({ children, condition, scrollId }, ref) => {
    return (
        <Box
            id={scrollId}
            ref={condition ? ref : null}
            border={condition ? "2px solid teal" : ""}
            borderRadius="base"
        >
            {children}
        </Box>
    );
});
ClickedContainerWrapper.displayName = "ClickedContainerWrapper";
export default React.memo(ClickedContainerWrapper);
